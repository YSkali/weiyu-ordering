import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishController } from './dish.controller';
import { AdminDishController } from './admin-dish.controller';
import { DishService } from './dish.service';
import { Dish } from '../../entities/dish.entity';
import { Category } from '../../entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dish, Category])],
  controllers: [DishController, AdminDishController],
  providers: [DishService],
  exports: [DishService],
})
export class DishModule {}
