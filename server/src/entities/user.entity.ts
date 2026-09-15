import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  OneToMany,
} from 'typeorm';
import { PointsFlow } from './points-flow.entity';
import { Order } from './order.entity';
import { Comment } from './comment.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ name: 'uid' })
  uid: number;

  @Column({ name: 'openid', type: 'varchar', length: 64, unique: true })
  openid: string;

  @Column({ name: 'role', type: 'varchar', length: 16, default: 'customer' })
  role: string;

  @Column({ name: 'nickname', type: 'varchar', length: 64, default: '用户' })
  nickname: string;

  @Column({ name: 'avatar', type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({ name: 'points', type: 'int', default: 0 })
  points: number;

  @VersionColumn({ name: 'version' })
  version: number;

  @Column({ name: 'status', type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @Column({ name: 'last_nickname_change_at', type: 'datetime', nullable: true })
  lastNicknameChangeAt: Date;

  @Column({ name: 'account', type: 'varchar', length: 64, nullable: true, unique: true })
  account: string;

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column({ name: 'group_code', type: 'varchar', length: 64, nullable: true })
  groupCode: string;

  @Column({ name: 'admin_uid', type: 'int', nullable: true })
  adminUid: number;

  @OneToMany(() => PointsFlow, (flow) => flow.user)
  pointsFlows: PointsFlow[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}
