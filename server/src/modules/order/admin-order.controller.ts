import { Controller, Get, Put, Body, Param, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('admin/orders')
@Roles('admin')
export class AdminOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async findAll(
    @CurrentUser('uid') adminUid: number,
    @Query('page') page?: number,
    @Query('size') size?: number,
    @Query('status') status?: string,
  ) {
    return this.orderService.findAllAdmin(adminUid, { page, size, status });
  }

  @Get(':id')
  async findOne(@Param('id') orderId: string) {
    return this.orderService.findOne(orderId);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') orderId: string,
    @Body('status') status: string,
    @CurrentUser('uid') adminUid: number,
  ) {
    return this.orderService.updateOrderStatus(orderId, status, adminUid);
  }

  @Put(':id/items/:itemId/status')
  async updateItemStatus(
    @Param('id') orderId: string,
    @Param('itemId') itemId: number,
    @Body('status') status: string,
    @CurrentUser('uid') adminUid: number,
  ) {
    return this.orderService.updateItemStatus(orderId, itemId, status, adminUid);
  }
}
