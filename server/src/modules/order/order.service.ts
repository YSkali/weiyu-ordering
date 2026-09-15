import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { User } from '../../entities/user.entity';
import { Dish } from '../../entities/dish.entity';
import { PointsFlow } from '../../entities/points-flow.entity';
import { DishService } from '../dish/dish.service';
import { CreateOrderDto } from './dto/create-order.dto';

// 订单状态流转规则
const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['preparing', 'completed'],
  created: ['preparing', 'cancelled'],
  preparing: ['completed'],
  completed: ['confirmed'],
  confirmed: [],
  cancelled: [],
};

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Dish)
    private dishRepository: Repository<Dish>,
    @InjectRepository(PointsFlow)
    private pointsFlowRepository: Repository<PointsFlow>,
    private dishService: DishService,
    private dataSource: DataSource,
  ) {}

  async createOrder(uid: number, dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('订单项不能为空');
    }

    // 校验用户状态
    const user = await this.userRepository.findOne({ where: { uid } });
    if (!user || user.status === 0) {
      throw new BadRequestException('账户已被禁用，无法下单');
    }

    // 计算总积分
    let totalPoints = 0;
    const orderItems: { dish: Dish; quantity: number; unitPrice: number }[] = [];

    for (const item of dto.items) {
      const dish = await this.dishRepository.findOne({
        where: { dishId: item.dishId, isDeleted: 0 },
      });

      if (!dish) {
        throw new NotFoundException(`菜品不存在: ${item.dishId}`);
      }

      // 校验菜品可见性：visibility=1 时仅白名单用户可点
      if (dish.visibility === 1) {
        const allowed = await this.dataSource
          .getRepository('dish_visible_users')
          .findOne({ where: { dishId: dish.dishId, uid } });
        if (!allowed) {
          throw new BadRequestException(`菜品 "${dish.name}" 不对您开放`);
        }
      }

      const unitPrice = await this.dishService.getCurrentPrice(item.dishId);
      totalPoints += unitPrice * item.quantity;
      orderItems.push({ dish, quantity: item.quantity, unitPrice });
    }

    // 生成订单号
    const orderId = 'ORD' + uuidv4().replace(/-/g, '').substring(0, 28);

    // 创建订单（状态：created，不扣积分，等管理员确认）
    const order = this.orderRepository.create({
      orderId,
      uid,
      status: 'created',
      totalPoints,
      remark: dto.remark,
    });
    await this.orderRepository.save(order);

    // 创建订单项
    for (const item of orderItems) {
      const orderItem = this.orderItemRepository.create({
        orderId,
        dishId: item.dish.dishId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        status: 'pending',
      });
      await this.orderItemRepository.save(orderItem);
    }

    this.logger.log(`订单创建成功: ${orderId}, 用户: ${uid}, 积分: ${totalPoints}`);

    return {
      orderId,
      status: 'created',
      totalPoints,
      items: orderItems.map((item) => ({
        dishId: item.dish.dishId,
        dishName: item.dish.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        status: 'pending',
      })),
      remark: dto.remark,
      createdAt: new Date(),
    };
  }

  async findAll(uid: number, params: { page?: number | string; size?: number | string; status?: string }) {
    const page = Number(params.page) || 1;
    const size = Number(params.size) || 10;
    const { status } = params;

    const where: any = { uid };
    if (status) {
      where.status = status;
    }

    const [list, total] = await this.orderRepository.findAndCount({
      where,
      relations: ['items', 'items.dish'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      list: list.map((order) => ({
        orderId: order.orderId,
        status: order.status,
        totalPoints: order.totalPoints,
        itemCount: order.items?.length || 0,
        remark: order.remark,
        createdAt: order.createdAt,
      })),
      total,
      page,
      size,
    };
  }

  async findOne(orderId: string, uid?: number) {
    const where: any = { orderId };
    if (uid) {
      where.uid = uid;
    }

    const order = await this.orderRepository.findOne({
      where,
      relations: ['items', 'items.dish', 'user'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return {
      orderId: order.orderId,
      uid: order.uid,
      nickname: order.user?.nickname,
      status: order.status,
      totalPoints: order.totalPoints,
      remark: order.remark,
      items: order.items?.map((item) => ({
        itemId: item.itemId,
        dishId: item.dishId,
        dishName: item.dish?.name,
        dishImage: item.dish?.imageUrl,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        status: item.status,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  async confirmOrder(orderId: string, uid: number) {
    const order = await this.orderRepository.findOne({
      where: { orderId, uid },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'completed') {
      throw new BadRequestException('只能确认已完成的订单');
    }

    order.status = 'confirmed';
    return this.orderRepository.save(order);
  }

  async updateOrderStatus(orderId: string, newStatus: string, adminUid?: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 加锁读取订单，防止并发重复处理
      const order = await queryRunner.manager.getRepository(Order)
        .createQueryBuilder('order')
        .setLock('pessimistic_write')
        .where('order.orderId = :orderId', { orderId })
        .getOne();

      if (!order) {
        throw new NotFoundException('订单不存在');
      }

      // 幂等：如果已经是目标状态，直接返回（防止重复奖励）
      if (order.status === newStatus) {
        return order;
      }

      const allowedTransitions = ORDER_STATUS_TRANSITIONS[order.status] || [];
      if (!allowedTransitions.includes(newStatus)) {
        throw new BadRequestException(`不能从 ${order.status} 变更为 ${newStatus}`);
      }

      // 管理员确认接单 → 扣顾客积分
      if (order.status === 'created' && newStatus === 'preparing') {
        const customer = await queryRunner.manager.getRepository(User)
          .createQueryBuilder('user')
          .setLock('pessimistic_write')
          .where('user.uid = :uid', { uid: order.uid })
          .getOne();

        if (!customer) throw new NotFoundException('顾客不存在');
        if (customer.points < order.totalPoints) {
          throw new BadRequestException(`顾客积分不足，当前: ${customer.points}，需要: ${order.totalPoints}`);
        }

        customer.points -= order.totalPoints;
        await queryRunner.manager.getRepository(User).save(customer);

        const flow = queryRunner.manager.getRepository(PointsFlow).create({
          uid: order.uid,
          change: -order.totalPoints,
          type: 'order_pay',
          relationId: orderId,
          remark: `订单支付: ${orderId}`,
        });
        await queryRunner.manager.getRepository(PointsFlow).save(flow);

        this.logger.log(`订单确认扣积分: ${orderId}, 顾客: ${order.uid}, 扣除: ${order.totalPoints}`);
      }

      // 订单完成 → 管理员获得积分（订单金额100%）
      if (newStatus === 'completed' && adminUid) {
        const admin = await queryRunner.manager.getRepository(User)
          .createQueryBuilder('user')
          .setLock('pessimistic_write')
          .where('user.uid = :uid', { uid: adminUid })
          .getOne();

        if (admin) {
          admin.points += order.totalPoints;
          await queryRunner.manager.getRepository(User).save(admin);

          const flow = queryRunner.manager.getRepository(PointsFlow).create({
            uid: adminUid,
            change: order.totalPoints,
            type: 'order_reward',
            relationId: orderId,
            remark: `订单完成奖励: ${orderId}`,
          });
          await queryRunner.manager.getRepository(PointsFlow).save(flow);

          this.logger.log(`管理员获得积分: ${orderId}, 管理员: ${adminUid}, 获得: ${order.totalPoints}`);
        }
      }

      order.status = newStatus;
      const savedOrder = await queryRunner.manager.getRepository(Order).save(order);

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateItemStatus(orderId: string, itemId: number, newStatus: string, adminUid?: number) {
    const item = await this.orderItemRepository.findOne({
      where: { itemId, orderId },
    });

    if (!item) {
      throw new NotFoundException('订单项不存在');
    }

    const allowedTransitions = ORDER_STATUS_TRANSITIONS[item.status] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `不能从 ${item.status} 变更为 ${newStatus}`,
      );
    }

    item.status = newStatus;
    await this.orderItemRepository.save(item);

    // 检查是否所有订单项都已完成，自动更新订单状态
    if (newStatus === 'completed') {
      const allItems = await this.orderItemRepository.find({
        where: { orderId },
      });

      const allCompleted = allItems.every(
        (i) => i.status === 'completed' || i.itemId === itemId,
      );

      if (allCompleted) {
        const order = await this.orderRepository.findOne({ where: { orderId } });
        if (order && order.status === 'preparing') {
          await this.updateOrderStatus(orderId, 'completed', adminUid);
        }
      }
    }

    return item;
  }

  // 管理员获取自己组的订单
  async findAllAdmin(adminUid: number, params: {
    page?: number | string;
    size?: number | string;
    status?: string;
  }) {
    const page = Number(params.page) || 1;
    const size = Number(params.size) || 10;
    const { status } = params;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.dish', 'dish')
      .where('user.adminUid = :adminUid', { adminUid });

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    qb.orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * size)
      .take(size);

    const [list, total] = await qb.getManyAndCount();

    return {
      list: list.map((order) => ({
        orderId: order.orderId,
        uid: order.uid,
        nickname: order.user?.nickname,
        status: order.status,
        totalPoints: order.totalPoints,
        remark: order.remark,
        items: order.items?.map((item) => ({
          itemId: item.itemId,
          dishId: item.dishId,
          dishName: item.dish?.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          status: item.status,
        })),
        createdAt: order.createdAt,
      })),
      total,
      page,
      size,
    };
  }
}
