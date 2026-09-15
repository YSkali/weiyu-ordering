import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('exchange_reward')
export class ExchangeReward {
  @PrimaryGeneratedColumn({ name: 'reward_id' })
  rewardId: number;

  @Column({ name: 'name', type: 'varchar', length: 64 })
  name: string;

  @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ name: 'required_points', type: 'int' })
  requiredPoints: number;

  @Column({ name: 'stock', type: 'int', default: -1 })
  stock: number;

  @Column({ name: 'type', type: 'varchar', length: 16, default: 'physical' })
  type: string;

  @Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
  imageUrl: string;

  @Column({ name: 'start_time', type: 'datetime', nullable: true })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime', nullable: true })
  endTime: Date;

  @Column({ name: 'status', type: 'tinyint', default: 1 })
  status: number;

  @Column({ name: 'creator_uid', type: 'int', nullable: true })
  creatorUid: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
