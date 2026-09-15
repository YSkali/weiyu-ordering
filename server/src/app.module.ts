import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

// 实体
import { User } from './entities/user.entity';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { PointsFlow } from './entities/points-flow.entity';
import { Comment } from './entities/comment.entity';
import { ExchangeReward } from './entities/exchange-reward.entity';
import { ExchangeRequest } from './entities/exchange-request.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

// 模块
import { AuthModule } from './modules/auth/auth.module';
import { DishModule } from './modules/dish/dish.module';
import { OrderModule } from './modules/order/order.module';
import { UserModule } from './modules/user/user.module';
import { ExchangeModule } from './modules/exchange/exchange.module';
import { CommentModule } from './modules/comment/comment.module';

@Module({
  imports: [
    // 环境变量
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 数据库
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_DATABASE', 'weiyu'),
        entities: [
          User,
          Category,
          Dish,
          PointsFlow,
          Comment,
          ExchangeReward,
          ExchangeRequest,
          Order,
          OrderItem,
        ],
        synchronize: false,
        dropSchema: false,
        logging: false,
        charset: 'utf8mb4',
      }),
    }),

    // JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'weiyu-secret'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '2h'),
        },
      }),
    }),

    // 业务模块
    AuthModule,
    DishModule,
    OrderModule,
    UserModule,
    ExchangeModule,
    CommentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
