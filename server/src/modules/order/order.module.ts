import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { AdminOrderController } from './admin-order.controller';
import { OrderService } from './order.service';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { User } from '../../entities/user.entity';
import { Dish } from '../../entities/dish.entity';
import { PointsFlow } from '../../entities/points-flow.entity';
import { DishModule } from '../dish/dish.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, User, Dish, PointsFlow]),
    DishModule,
  ],
  controllers: [OrderController, AdminOrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
