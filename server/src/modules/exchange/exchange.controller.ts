import { Controller, Get, Post, Put, Delete, Body, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

class CreateExchangeRequestDto {
  @IsInt()
  rewardId: number;

  @IsOptional()
  @IsString()
  remark?: string;
}

class CreateRewardDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  requiredPoints: number;

  @IsOptional()
  @IsString()
  type?: string;
}

class UpdateRewardDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  requiredPoints?: number;
}

@Controller('exchange')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Get('rewards')
  @Public()
  async getRewards(
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    return this.exchangeService.getRewards({ page, size });
  }

  // 顾客创建奖励（花费顾客积分）
  @Post('rewards')
  @Roles('customer')
  async createReward(
    @CurrentUser('uid') uid: number,
    @Body() dto: CreateRewardDto,
  ) {
    return this.exchangeService.createRewardByCustomer(uid, dto);
  }

  // 顾客编辑奖励（仅待审核或已拒绝状态可编辑）
  @Put('rewards/:id')
  @Roles('customer')
  async updateReward(
    @CurrentUser('uid') uid: number,
    @Param('id', ParseIntPipe) rewardId: number,
    @Body() dto: UpdateRewardDto,
  ) {
    return this.exchangeService.updateReward(uid, rewardId, dto);
  }

  // 顾客删除奖励（仅待审核状态可删除）
  @Delete('rewards/:id')
  @Roles('customer')
  async deleteReward(
    @CurrentUser('uid') uid: number,
    @Param('id', ParseIntPipe) rewardId: number,
  ) {
    return this.exchangeService.deleteReward(uid, rewardId);
  }

  // 顾客查看自己创建的奖励
  @Get('my-rewards')
  @Roles('customer')
  async getMyRewards(
    @CurrentUser('uid') uid: number,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    return this.exchangeService.getMyRewards(uid, { page, size });
  }

  @Post('requests')
  @Roles('customer')
  async createRequest(
    @CurrentUser('uid') uid: number,
    @Body() dto: CreateExchangeRequestDto,
  ) {
    return this.exchangeService.createRequest(uid, dto.rewardId, dto.remark);
  }

  @Get('requests')
  async getRequests(
    @CurrentUser('uid') uid: number,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    return this.exchangeService.getRequests(uid, { page, size });
  }
}
