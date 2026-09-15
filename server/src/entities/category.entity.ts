import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Dish } from './dish.entity';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn({ name: 'cate_id' })
  cateId: number;

  @Column({ name: 'name', type: 'varchar', length: 32 })
  name: string;

  @Column({ name: 'sort', type: 'int', default: 0 })
  sort: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Dish, (dish) => dish.category)
  dishes: Dish[];
}
