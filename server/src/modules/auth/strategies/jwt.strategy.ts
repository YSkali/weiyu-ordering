import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'weiyu-secret'),
    });
  }

  async validate(payload: { uid: number; role: string; groupCode?: string }) {
    const user = await this.userRepository.findOne({
      where: { uid: payload.uid },
    });
    if (!user || user.status === 0) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    // 顾客：检查管理员口令是否变更
    if (user.role === 'customer' && user.adminUid && payload.groupCode) {
      const admin = await this.userRepository.findOne({
        where: { uid: user.adminUid },
      });
      if (admin && admin.groupCode && admin.groupCode !== payload.groupCode) {
        throw new UnauthorizedException('GROUP_CODE_CHANGED');
      }
    }

    return { uid: user.uid, role: user.role, nickname: user.nickname, adminUid: user.adminUid };
  }
}
