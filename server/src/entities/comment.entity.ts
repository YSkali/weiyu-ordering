import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Dish } from './dish.entity';
import { User } from './user.entity';

@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn({ name: 'comment_id' })
  commentId: number;

  @Column({ name: 'dish_id', type: 'int' })
  dishId: number;

  @Column({ name: 'uid', type: 'int' })
  uid: number;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({ name: 'rating', type: 'tinyint', default: 5 })
  rating: number;

  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parentId: number;

  @Column({ name: 'is_top', type: 'tinyint', default: 0 })
  isTop: number;

  @Column({ name: 'status', type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Dish)
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'uid' })
  user: User;

  @ManyToOne(() => Comment)
  @JoinColumn({ name: 'parent_id' })
  parent: Comment;
}
