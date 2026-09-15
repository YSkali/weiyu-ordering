import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Dish } from './dish.entity';
import { User } from './user.entity';

@Entity('dish_visible_users')
export class DishVisibleUsers {
  @PrimaryColumn({ name: 'dish_id' })
  dishId: number;

  @PrimaryColumn({ name: 'uid' })
  uid: number;

  @ManyToOne(() => Dish)
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uid' })
  user: User;
}
