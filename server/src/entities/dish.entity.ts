import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';

@Entity('dish')
export class Dish {
  @PrimaryGeneratedColumn({ name: 'dish_id' })
  dishId: number;

  @Column({ name: 'name', type: 'varchar', length: 64 })
  name: string;

  @Column({ name: 'price', type: 'int' })
  price: number;

  @Column({ name: 'activity_price', type: 'int', nullable: true })
  activityPrice: number;

  @Column({ name: 'activity_start', type: 'datetime', nullable: true })
  activityStart: Date;

  @Column({ name: 'activity_end', type: 'datetime', nullable: true })
  activityEnd: Date;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'image_url', type: 'varchar', length: 255, default: '' })
  imageUrl: string;

  @Column({ name: 'cate_id', type: 'int' })
  cateId: number;

  @Column({ name: 'visibility', type: 'tinyint', default: 0 })
  visibility: number;

  @Column({ name: 'comment_enabled', type: 'tinyint', default: 1 })
  commentEnabled: number;

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0 })
  isDeleted: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.dishes)
  @JoinColumn({ name: 'cate_id' })
  category: Category;
}
