import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { AdminUserController } from './admin-user.controller';
import { UserService } from './user.service';
import { User } from '../../entities/user.entity';
import { PointsFlow } from '../../entities/points-flow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, PointsFlow])],
  controllers: [UserController, AdminUserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
