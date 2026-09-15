import { Controller, Get, Put, Post, Body, Param, Query } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsOptional, IsString, IsIn } from 'class-validator';

class ReviewExchangeDto {
  @IsString()
  @IsIn(['approved', 'rejected'])
  status: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

@Controller('admin/exchange')
@Roles('admin')
export class AdminExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  // 管理员查看所有奖励（顾客创建的，包括pending和已处理的）
  @Get('rewards')
  async getRewards(
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    return this.exchangeService.getRewards({ page, size });
  }

  // 管理员同意奖励（仅验证，不涉及积分）
  @Post('rewards/:id/approve')
  async approveReward(@Param('id') rewardId: number) {
    return this.exchangeService.approveReward(rewardId);
  }

  // 管理员拒绝奖励
  @Post('rewards/:id/reject')
  async rejectReward(@Param('id') rewardId: number) {
    return this.exchangeService.rejectReward(rewardId);
  }

  // 管理员兑换已同意的奖励（扣除管理员积分）
  @Post('rewards/:id/claim')
  async claimReward(
    @Param('id') rewardId: number,
    @CurrentUser('uid') adminUid: number,
  ) {
    return this.exchangeService.claimReward(adminUid, rewardId);
  }

  @Get('requests')
  async getAllRequests(
    @Query('page') page?: number,
    @Query('size') size?: number,
    @Query('status') status?: string,
  ) {
    return this.exchangeService.getAllRequests({ page, size, status });
  }

  @Put('requests/:id')
  async reviewRequest(
    @Param('id') id: number,
    @Body() dto: ReviewExchangeDto,
  ) {
    return this.exchangeService.reviewRequest(id, dto.status, dto.remark);
  }
}
