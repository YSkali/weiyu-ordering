import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(code: string, nickname?: string, avatar?: string) {
    // 调用微信 jscode2session 接口获取 openid
    const appid = this.configService.get('WECHAT_APPID');
    const secret = this.configService.get('WECHAT_SECRET');

    let openid: string;

    try {
      // 开发模式：如果 code 以 test_ 开头，使用 mock openid
      if (code.startsWith('test_')) {
        openid = 'test_openid_' + code.replace('test_', '');
        this.logger.warn(`开发模式：使用 mock openid: ${openid}`);
      } else {
        const wxRes = await axios.get(
          `https://api.weixin.qq.com/sns/jscode2session`,
          {
            params: {
              appid,
              secret,
              js_code: code,
              grant_type: 'authorization_code',
            },
          },
        );

        if (wxRes.data.errcode) {
          throw new UnauthorizedException('微信登录失败');
        }

        openid = wxRes.data.openid;
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('微信登录接口调用失败', error);
      throw new UnauthorizedException('微信登录失败');
    }

    // 查找或创建用户
    let user = await this.userRepository.findOne({ where: { openid } });

    if (!user) {
      user = this.userRepository.create({
        openid,
        role: 'customer',
        nickname: nickname || '用户',
        avatar: avatar || '',
        points: 0,
        status: 1,
      });
      user = await this.userRepository.save(user);
      this.logger.log(`新用户注册: uid=${user.uid}, nickname=${user.nickname}`);
    }

    // 生成 JWT
    const payload = { uid: user.uid, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      uid: user.uid,
      role: user.role,
      nickname: user.nickname,
      avatar: user.avatar,
      points: user.points,
    };
  }

  async getProfile(uid: number) {
    const user = await this.userRepository.findOne({ where: { uid } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return {
      uid: user.uid,
      nickname: user.nickname,
      avatar: user.avatar,
      points: user.points,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  async accountLogin(account: string, password: string, groupCode?: string) {
    // 规范化输入
    const normalizedAccount = account.trim();

    // 按 account 查找（全局唯一）
    const user = await this.userRepository.findOne({ where: { account: normalizedAccount } });

    if (user) {
      // 检查账户是否被禁用
      if (user.status === 0) {
        throw new UnauthorizedException('该账号已被管理员禁用，请联系管理员解封');
      }

      // 用户存在 → 验证密码
      if (!user.password) {
        throw new UnauthorizedException('该账号不支持密码登录');
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new UnauthorizedException('密码错误');
      }

      // 顾客需要验证口令
      if (user.role === 'customer') {
        if (!groupCode) {
          throw new UnauthorizedException('请输入口令');
        }
        const admin = await this.userRepository.findOne({
          where: { uid: user.adminUid },
        });
        if (!admin) {
          throw new UnauthorizedException('所属管理员不存在，请联系管理员');
        }
        if (admin.groupCode !== groupCode) {
          throw new UnauthorizedException('口令错误');
        }
      }

      const token = this.jwtService.sign({
        uid: user.uid,
        role: user.role,
        groupCode: groupCode || '',
      });

      return {
        token,
        uid: user.uid,
        role: user.role,
        nickname: user.nickname,
        avatar: user.avatar,
        points: user.points,
        isNew: false,
      };
    }

    // ========== 用户不存在 → 注册流程 ==========

    // 管理员不允许注册
    if (!groupCode) {
      throw new UnauthorizedException('管理员账户不支持注册，请联系系统管理员');
    }

    // 顾客注册：验证口令 → 找到对应管理员
    const admin = await this.userRepository.findOne({
      where: { role: 'admin', groupCode },
    });
    if (!admin) {
      throw new UnauthorizedException('口令错误，无法注册');
    }

    // 二次检查：account 可能因 trim 后匹配到（防御性）
    const existingAccount = await this.userRepository.findOne({
      where: { account: normalizedAccount },
    });
    if (existingAccount) {
      throw new UnauthorizedException('该账号已被使用，请更换账号或直接登录');
    }

    const hashedPw = await bcrypt.hash(password, 10);
    const openid = 'account_' + normalizedAccount;

    // 检查是否已有同 openid 的旧记录（之前注册失败留下的）
    let userToSave = await this.userRepository.findOne({ where: { openid } });

    if (userToSave) {
      // 旧记录存在，更新它
      userToSave.account = normalizedAccount;
      userToSave.password = hashedPw;
      userToSave.role = 'customer';
      userToSave.nickname = normalizedAccount;
      userToSave.adminUid = admin.uid;
      userToSave.status = 1;
    } else {
      // 创建新记录
      userToSave = this.userRepository.create({
        openid,
        account: normalizedAccount,
        password: hashedPw,
        role: 'customer',
        nickname: normalizedAccount,
        adminUid: admin.uid,
        points: 0,
        status: 1,
      });
    }

    const saved = await this.userRepository.save(userToSave);
    this.logger.log(`新顾客注册: uid=${saved.uid}, account=${normalizedAccount}, admin=${admin.uid}`);

    const token = this.jwtService.sign({
      uid: saved.uid,
      role: saved.role,
      groupCode,
    });

    return {
      token,
      uid: saved.uid,
      role: saved.role,
      nickname: saved.nickname,
      avatar: saved.avatar,
      points: saved.points,
      isNew: true,
    };
  }
}
