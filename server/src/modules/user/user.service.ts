import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { PointsFlow } from '../../entities/points-flow.entity';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PointsFlow)
    private pointsFlowRepository: Repository<PointsFlow>,
  ) {}

  async getPointsFlow(uid: number, params: { page?: number | string; size?: number | string }) {
    const page = Number(params.page) || 1;
    const size = Number(params.size) || 10;

    const [list, total] = await this.pointsFlowRepository.findAndCount({
      where: { uid },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      list: list.map((flow) => ({
        flowId: flow.flowId,
        change: flow.change,
        type: flow.type,
        relationId: flow.relationId,
        remark: flow.remark,
        createdAt: flow.createdAt,
      })),
      total,
      page,
      size,
    };
  }

  async findAllAdmin(adminUid: number, params: {
    page?: number | string;
    size?: number | string;
    keyword?: string;
  }) {
    const page = Number(params.page) || 1;
    const size = Number(params.size) || 10;
    const { keyword } = params;

    const qb = this.userRepository.createQueryBuilder('user');

    // 只返回该管理员组的顾客
    qb.where('user.adminUid = :adminUid', { adminUid });

    if (keyword) {
      qb.andWhere('user.nickname LIKE :keyword', { keyword: `%${keyword}%` });
    }

    qb.orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * size)
      .take(size);

    const [list, total] = await qb.getManyAndCount();

    return {
      list: list.map((user) => ({
        uid: user.uid,
        nickname: user.nickname,
        avatar: user.avatar,
        points: user.points,
        role: user.role,
        status: user.status,
        adminUid: user.adminUid,
        createdAt: user.createdAt,
      })),
      total,
      page,
      size,
    };
  }

  // 每日签到
  async signIn(uid: number) {
    const SIGN_IN_POINTS = 10;

    // 检查今天是否已签到
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingFlow = await this.pointsFlowRepository
      .createQueryBuilder('flow')
      .where('flow.uid = :uid', { uid })
      .andWhere('flow.type = :type', { type: 'sign_in' })
      .andWhere('flow.created_at >= :today', { today })
      .andWhere('flow.created_at < :tomorrow', { tomorrow })
      .getOne();

    if (existingFlow) {
      throw new BadRequestException('今天已经签到过了');
    }

    const queryRunner = this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.getRepository(User)
        .createQueryBuilder('user')
        .setLock('pessimistic_write')
        .where('user.uid = :uid', { uid })
        .getOne();

      if (!user) throw new NotFoundException('用户不存在');

      user.points += SIGN_IN_POINTS;
      await queryRunner.manager.getRepository(User).save(user);

      const flow = queryRunner.manager.getRepository(PointsFlow).create({
        uid,
        change: SIGN_IN_POINTS,
        type: 'sign_in',
        remark: `每日签到 +${SIGN_IN_POINTS}积分`,
      });
      await queryRunner.manager.getRepository(PointsFlow).save(flow);

      await queryRunner.commitTransaction();

      return {
        points: user.points,
        change: SIGN_IN_POINTS,
        message: `签到成功，获得${SIGN_IN_POINTS}积分`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async adjustPoints(adminUid: number, uid: number, change: number, remark: string) {
    const user = await this.userRepository.findOne({ where: { uid } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    if (user.adminUid !== adminUid) {
      throw new BadRequestException('只能操作自己组的顾客');
    }

    if (user.points + change < 0) {
      throw new BadRequestException('积分不能为负数');
    }

    // 使用事务
    const queryRunner = this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      user.points += change;
      await queryRunner.manager.getRepository(User).save(user);

      const flow = queryRunner.manager.getRepository(PointsFlow).create({
        uid,
        change,
        type: change > 0 ? 'admin_add' : 'admin_sub',
        remark,
      });
      await queryRunner.manager.getRepository(PointsFlow).save(flow);

      await queryRunner.commitTransaction();

      return {
        uid: user.uid,
        nickname: user.nickname,
        points: user.points,
        change,
        remark,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateProfile(uid: number, data: { nickname?: string; avatar?: string }) {
    const user = await this.userRepository.findOne({ where: { uid } });
    if (!user) throw new NotFoundException('用户不存在');

    if (data.nickname !== undefined) {
      const now = new Date();
      if (user.lastNicknameChangeAt) {
        const lastChange = new Date(user.lastNicknameChangeAt);
        const diffDays = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 30) {
          const remainDays = 30 - diffDays;
          throw new BadRequestException(`昵称每月只能修改一次，还需等待 ${remainDays} 天`);
        }
      }

      // 检查新昵称是否已被其他用户作为账号使用
      const trimmed = data.nickname.trim();
      const existing = await this.userRepository.findOne({ where: { account: trimmed } });
      if (existing && existing.uid !== uid) {
        throw new BadRequestException('该名称已被其他用户使用，请更换');
      }

      user.nickname = trimmed;
      // 不再同步修改账号，账号注册后固定
      user.lastNicknameChangeAt = now;
    }

    if (data.avatar !== undefined) {
      user.avatar = data.avatar;
    }

    const saved = await this.userRepository.save(user);
    return {
      uid: saved.uid,
      nickname: saved.nickname,
      avatar: saved.avatar,
      points: saved.points,
      role: saved.role,
    };
  }

  async uploadAvatar(uid: number, file: any) {
    if (!file) throw new BadRequestException('请选择头像文件');

    const user = await this.userRepository.findOne({ where: { uid } });
    if (!user) throw new NotFoundException('用户不存在');

    // 确保上传目录存在
    const uploadDir = join(__dirname, '..', '..', '..', 'uploads', 'avatars');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    // 文件已由 multer 保存，返回访问路径
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    user.avatar = avatarUrl;
    await this.userRepository.save(user);

    return { avatar: avatarUrl };
  }

  async changeAccount(uid: number, newAccount: string, password: string) {
    const user = await this.userRepository.findOne({ where: { uid } });
    if (!user) throw new NotFoundException('用户不存在');

    if (!user.password) throw new BadRequestException('该账号不支持修改账号');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new BadRequestException('密码错误');

    const existing = await this.userRepository.findOne({ where: { account: newAccount } });
    if (existing && existing.uid !== uid) {
      throw new BadRequestException('该账号已被使用');
    }

    user.account = newAccount;
    await this.userRepository.save(user);
    return { account: newAccount, message: '账号修改成功' };
  }

  async changePassword(uid: number, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { uid } });
    if (!user) throw new NotFoundException('用户不存在');

    if (!user.password) throw new BadRequestException('该账号不支持修改密码');
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) throw new BadRequestException('原密码错误');

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
    return { message: '密码修改成功' };
  }

  async setGroupCode(uid: number, groupCode: string) {
    const user = await this.userRepository.findOne({ where: { uid } });
    if (!user) throw new NotFoundException('用户不存在');
    if (user.role !== 'admin') throw new BadRequestException('仅管理员可设置口令');

    user.groupCode = groupCode;
    await this.userRepository.save(user);
    return { groupCode, message: '口令设置成功' };
  }

  async deleteCustomer(adminUid: number, customerUid: number) {
    const customer = await this.userRepository.findOne({ where: { uid: customerUid } });
    if (!customer || customer.deletedAt) throw new NotFoundException('用户不存在');
    if (customer.role !== 'customer') throw new BadRequestException('只能删除顾客账户');
    if (customer.adminUid !== adminUid) throw new BadRequestException('只能删除自己组的顾客');

    // 软删除：保留历史数据，仅标记删除
    customer.status = 0;
    await this.userRepository.softDelete(customerUid);

    return { message: '删除成功' };
  }

  async banCustomer(adminUid: number, customerUid: number) {
    const customer = await this.userRepository.findOne({ where: { uid: customerUid } });
    if (!customer) throw new NotFoundException('用户不存在');
    if (customer.role !== 'customer') throw new BadRequestException('只能禁用顾客账户');
    if (customer.adminUid !== adminUid) throw new BadRequestException('只能禁用自己组的顾客');

    customer.status = 0;
    await this.userRepository.save(customer);
    return { message: '已禁用' };
  }

  async unbanCustomer(adminUid: number, customerUid: number) {
    const customer = await this.userRepository.findOne({ where: { uid: customerUid } });
    if (!customer) throw new NotFoundException('用户不存在');
    if (customer.role !== 'customer') throw new BadRequestException('只能解封顾客账户');
    if (customer.adminUid !== adminUid) throw new BadRequestException('只能解封自己组的顾客');

    customer.status = 1;
    await this.userRepository.save(customer);
    return { message: '已解封' };
  }
}
