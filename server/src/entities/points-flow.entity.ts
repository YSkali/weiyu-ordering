import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('points_flow')
export class PointsFlow {
  @PrimaryGeneratedColumn({ name: 'flow_id' })
  flowId: number;

  @Column({ name: 'uid', type: 'int' })
  uid: number;

  @Column({ name: 'change', type: 'int' })
  change: number;

  @Column({ name: 'type', type: 'varchar', length: 32 })
  type: string;

  @Column({ name: 'relation_id', type: 'varchar', length: 64, nullable: true })
  relationId: string;

  @Column({ name: 'remark', type: 'varchar', length: 255, nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.pointsFlows)
  @JoinColumn({ name: 'uid' })
  user: User;
}
