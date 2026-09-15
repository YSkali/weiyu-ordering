import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ExchangeReward } from './exchange-reward.entity';

@Entity('exchange_request')
export class ExchangeRequest {
  @PrimaryGeneratedColumn({ name: 'request_id' })
  requestId: number;

  @Column({ name: 'uid', type: 'int' })
  uid: number;

  @Column({ name: 'reward_id', type: 'int' })
  rewardId: number;

  @Column({ name: 'status', type: 'varchar', length: 16, default: 'pending' })
  status: string;

  @Column({ name: 'remark', type: 'varchar', length: 255, nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uid' })
  user: User;

  @ManyToOne(() => ExchangeReward)
  @JoinColumn({ name: 'reward_id' })
  reward: ExchangeReward;
}
