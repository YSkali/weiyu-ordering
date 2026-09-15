import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ExchangeReward } from '../../entities/exchange-reward.entity';
import { ExchangeRequest } from '../../entities/exchange-request.entity';
import { User } from '../../entities/user.entity';
import { PointsFlow } from '../../entities/points-flow.entity';

@Injectable()
export class ExchangeService {
  private readonly logger = new Logger(ExchangeService.name);

  constructor(
    @InjectRepository(ExchangeReward)
    private rewardRepository: Repository<ExchangeReward>,
    @InjectRepository(ExchangeRequest)
    private requestRepository: Repository<ExchangeRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PointsFlow)
    private pointsFlowRepository: Repository<PointsFlow>,
    private dataSource: DataSource,
  ) {}

  // 获取所有奖励（管理员看pending+active，顾客看active）
  async getRewards(params: { page?: number | string; size?: number | string; status?: number }) {
    const page = Number(params.page) || 1;
    const size = Number(params.size) || 10;

    const where: any = {};
    if (params.status !== undefined) {
      where.status = params.status;
    }

    const [list, total] = await this.rewardRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      list: list.map((reward) => ({
        rewardId: reward.rewardId,
        name: reward.name,
        description: reward.description,
        requiredPoints: reward.requiredPoints,
        stock: reward.stock,
        type: reward.type,
        imageUrl: reward.imageUrl,
        creatorUid: reward.creatorUid,
        status: reward.status,
        startTime: reward.startTime,
        endTime: reward.endTime,
        createdAt: reward.createdAt,
      })),
      total,
      page,
      size,
    };
  }

  // 顾客创建奖励（不扣积分，状态为pending等待管理员审核）
  async createRewardByCustomer(uid: number, data: {
    name: string;
    description?: string;
    requiredPoints: number;
    type?: string;
  }) {
    if (!data.name || !data.requiredPoints || data.requiredPoints <= 0) {
      throw new BadRequestException('请填写奖励名称和积分（大于0）');
    }

    const reward = this.rewardRepository.create({
      name: data.name,
      description: data.description || '',
      requiredPoints: data.requiredPoints,
      stock: 1,
      type: data.type || 'custom',
      status: 0, // pending 等待管理员审核
      creatorUid: uid,
    });
    const savedReward = await this.rewardRepository.save(reward);

    this.logger.log(`顾客创建奖励: uid=${uid}, reward=${savedReward.rewardId}, 积分=${data.requiredPoints}`);
    return savedReward;
  }

  // 顾客编辑奖励（仅待审核状态可编辑，编辑后重置为待审核）
  async updateReward(uid: number, rewardId: number, data: {
    name?: string;
    description?: string;
    requiredPoints?: number;
  }) {
    const reward = await this.rewardRepository.findOne({
      where: { rewardId, creatorUid: uid },
    });

    if (!reward) throw new NotFoundException('奖励不存在');
    if (reward.status !== 0 && reward.status !== 2) {
      throw new BadRequestException('只能编辑待审核或已拒绝的奖励');
    }

    if (data.name) reward.name = data.name;
    if (data.description !== undefined) reward.description = data.description;
    if (data.requiredPoints && data.requiredPoints > 0) reward.requiredPoints = data.requiredPoints;
    reward.status = 0; // 重置为待审核

    const saved = await this.rewardRepository.save(reward);
    this.logger.log(`顾客编辑奖励: uid=${uid}, reward=${rewardId}`);
    return saved;
  }

  // 顾客删除奖励（仅待审核状态可删除）
  async deleteReward(uid: number, rewardId: number) {
    const reward = await this.rewardRepository.findOne({
      where: { rewardId, creatorUid: uid },
    });

    if (!reward) throw new NotFoundException('奖励不存在');
    if (reward.status !== 0) {
      throw new BadRequestException('只能删除待审核的奖励');
    }

    await this.rewardRepository.remove(reward);
    this.logger.log(`顾客删除奖励: uid=${uid}, reward=${rewardId}`);
    return { message: '已删除' };
  }

  // 管理员同意奖励（仅验证，不涉及积分）
  async approveReward(rewardId: number) {
    const reward = await this.rewardRepository.findOne({
      where: { rewardId, status: 0 },
    });

    if (!reward) throw new NotFoundException('奖励不存在或已被处理');

    reward.status = 1; // approved
    await this.rewardRepository.save(reward);

    this.logger.log(`管理员同意奖励: reward=${rewardId}`);
    return { message: '已同意' };
  }

  // 管理员拒绝奖励
  async rejectReward(rewardId: number) {
    const reward = await this.rewardRepository.findOne({
      where: { rewardId, status: 0 },
    });

    if (!reward) throw new NotFoundException('奖励不存在或已被处理');

    reward.status = 2; // rejected
    await this.rewardRepository.save(reward);
    return { message: '已拒绝' };
  }

  // 管理员兑换已同意的奖励（扣除管理员积分）
  async claimReward(adminUid: number, rewardId: number) {
    const reward = await this.rewardRepository.findOne({
      where: { rewardId, status: 1 },
    });

    if (!reward) throw new NotFoundException('奖励不存在或未通过审核');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const admin = await queryRunner.manager.getRepository(User)
        .createQueryBuilder('user')
        .setLock('pessimistic_write')
        .where('user.uid = :uid', { uid: adminUid })
        .getOne();

      if (!admin) throw new NotFoundException('管理员不存在');
      if (admin.points < reward.requiredPoints) {
        throw new BadRequestException(`积分不足，当前: ${admin.points}，需要: ${reward.requiredPoints}`);
      }

      // 扣管理员积分
      admin.points -= reward.requiredPoints;
      await queryRunner.manager.getRepository(User).save(admin);

      // 更新奖励状态为已兑换
      reward.status = 3;
      await queryRunner.manager.getRepository(ExchangeReward).save(reward);

      // 积分流水
      const flow = queryRunner.manager.getRepository(PointsFlow).create({
        uid: adminUid,
        change: -reward.requiredPoints,
        type: 'exchange_sub',
        relationId: String(rewardId),
        remark: `兑换奖励: ${reward.name}`,
      });
      await queryRunner.manager.getRepository(PointsFlow).save(flow);

      await queryRunner.commitTransaction();
      this.logger.log(`管理员兑换奖励: adminUid=${adminUid}, reward=${rewardId}, 扣除=${reward.requiredPoints}`);
      return { message: '兑换成功' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 获取顾客创建的奖励列表
  async getMyRewards(uid: number, params: { page?: number | string; size?: number | string }) {
    const page = Number(params.page) || 1;
    const size = Number(params.size) || 10;

    const [list, total] = await this.rewardRepository.findAndCount({
      where: { creatorUid: uid },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      list: list.map((reward) => ({
        rewardId: reward.rewardId,
        name: reward.name,
        description: reward.description,
        requiredPoints: reward.requiredPoints,
        stock: reward.stock,
        type: reward.type,
        status: reward.status,
        createdAt: reward.createdAt,
      })),
      total,
      page,
      size,
    };
  }

  async createRequest(uid: number, rewardId: number, remark?: string) {
    const reward = await this.rewardRepository.findOne({
      where: { rewardId, status: 1 },
    });

    if (!reward) throw new NotFoundException('奖励不存在或已下架');
    if (reward.stock === 0) throw new BadRequestException('库存不足');

    const user = await this.userRepository.findOne({ where: { uid } });
    if (!user) throw new NotFoundException('用户不存在');
    if (user.points < reward.requiredPoints) {
      throw new BadRequestException(`积分不足，当前: ${user.points}，需要: ${reward.requiredPoints}`);
    }

    const existingRequest = await this.requestRepository.findOne({
      where: { uid, rewardId, status: 'pending' },
    });
    if (existingRequest) throw new BadRequestException('已有待审核的兑换申请');

    const request = this.requestRepository.create({
      uid, rewardId, remark, status: 'pending',
    });
    return this.requestRepository.save(request);
  }

  async getRequests(uid: number, params: { page?: number | string; size?: number | string }) {
    const page = Number(params.page) || 1;
    const size = Number(params.size) || 10;

    const [list, total] = await this.requestRepository.findAndCount({
      where: { uid },
      relations: ['reward'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      list: list.map((req) => ({
        requestId: req.requestId,
        rewardName: req.reward?.name,
        requiredPoints: req.reward?.requiredPoints,
        status: req.status,
        remark: req.remark,
        createdAt: req.createdAt,
      })),
      total,
      page,
      size,
    };
  }

  async reviewRequest(requestId: number, status: string, remark?: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 事务内加锁读取请求，防止并发重复审核
      const request = await queryRunner.manager.getRepository(ExchangeRequest)
        .createQueryBuilder('req')
        .setLock('pessimistic_write')
        .leftJoinAndSelect('req.reward', 'reward')
        .leftJoinAndSelect('req.user', 'user')
        .where('req.requestId = :requestId', { requestId })
        .getOne();

      if (!request) throw new NotFoundException('兑换请求不存在');
      if (request.status !== 'pending') throw new BadRequestException('该请求已被处理');

      if (status === 'approved') {
        const user = await queryRunner.manager.getRepository(User)
          .createQueryBuilder('user')
          .setLock('pessimistic_write')
          .where('user.uid = :uid', { uid: request.uid })
          .getOne();

        if (!user) throw new NotFoundException('用户不存在');
        if (user.points < request.reward.requiredPoints) {
          throw new BadRequestException('用户积分不足');
        }

        user.points -= request.reward.requiredPoints;
        await queryRunner.manager.getRepository(User).save(user);

        request.status = 'approved';
        request.remark = remark || '';
        await queryRunner.manager.getRepository(ExchangeRequest).save(request);

        if (request.reward.stock > 0) {
          request.reward.stock -= 1;
          await queryRunner.manager.getRepository(ExchangeReward).save(request.reward);
        }

        const flow = queryRunner.manager.getRepository(PointsFlow).create({
          uid: request.uid,
          change: -request.reward.requiredPoints,
          type: 'exchange_sub',
          relationId: String(requestId),
          remark: `兑换: ${request.reward.name}`,
        });
        await queryRunner.manager.getRepository(PointsFlow).save(flow);

        await queryRunner.commitTransaction();
        this.logger.log(`兑换审核通过: requestId=${requestId}`);
        return { message: '审核通过' };
      } else {
        // 拒绝也走事务，保证一致性
        request.status = 'rejected';
        request.remark = remark || '';
        await queryRunner.manager.getRepository(ExchangeRequest).save(request);
        await queryRunner.commitTransaction();
        return { message: '已拒绝' };
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAllRequests(params: { page?: number; size?: number; status?: string }) {
    const { page = 1, size = 10, status } = params;
    const where: any = {};
    if (status) where.status = status;

    const [list, total] = await this.requestRepository.findAndCount({
      where,
      relations: ['reward', 'user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      list: list.map((req) => ({
        requestId: req.requestId,
        uid: req.uid,
        nickname: req.user?.nickname,
        rewardName: req.reward?.name,
        requiredPoints: req.reward?.requiredPoints,
        status: req.status,
        remark: req.remark,
        createdAt: req.createdAt,
      })),
      total,
      page,
      size,
    };
  }
}
