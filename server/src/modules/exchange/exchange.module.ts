import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeController } from './exchange.controller';
import { AdminExchangeController } from './admin-exchange.controller';
import { ExchangeService } from './exchange.service';
import { ExchangeReward } from '../../entities/exchange-reward.entity';
import { ExchangeRequest } from '../../entities/exchange-request.entity';
import { User } from '../../entities/user.entity';
import { PointsFlow } from '../../entities/points-flow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExchangeReward, ExchangeRequest, User, PointsFlow]),
  ],
  controllers: [ExchangeController, AdminExchangeController],
  providers: [ExchangeService],
  exports: [ExchangeService],
})
export class ExchangeModule {}
