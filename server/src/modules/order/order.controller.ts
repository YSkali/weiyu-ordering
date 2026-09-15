import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles('customer')
  async create(
    @CurrentUser('uid') uid: number,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(uid, dto);
  }

  @Get()
  async findAll(
    @CurrentUser('uid') uid: number,
    @Query('page') page?: number,
    @Query('size') size?: number,
    @Query('status') status?: string,
  ) {
    return this.orderService.findAll(uid, { page, size, status });
  }

  @Get(':id')
  async findOne(
    @Param('id') orderId: string,
    @CurrentUser('uid') uid: number,
  ) {
    return this.orderService.findOne(orderId, uid);
  }

  @Post(':id/confirm')
  @Roles('customer')
  async confirm(
    @Param('id') orderId: string,
    @CurrentUser('uid') uid: number,
  ) {
    return this.orderService.confirmOrder(orderId, uid);
  }
}
