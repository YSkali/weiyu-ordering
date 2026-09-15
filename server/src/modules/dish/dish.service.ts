import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from '../../entities/dish.entity';
import { Category } from '../../entities/category.entity';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

@Injectable()
export class DishService {
  constructor(
    @InjectRepository(Dish)
    private dishRepository: Repository<Dish>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(params: {
    page?: number | string;
    size?: number | string;
    cateId?: number | string;
    keyword?: string;
    isDeleted?: number;
  }) {
    const page = Number(params.page) || 1;
    const size = Number(params.size) || 10;
    const cateId = params.cateId ? Number(params.cateId) : undefined;
    const { keyword, isDeleted } = params;

    // 用原生 SQL 避免 TypeORM 列映射冲突
    let sql = `SELECT d.dish_id AS dishId, d.name, d.price, d.activity_price AS activityPrice,
      d.activity_start AS activityStart, d.activity_end AS activityEnd,
      d.image_url AS imageUrl, d.description, d.cate_id AS cateId,
      c.name AS cateName, d.comment_enabled AS commentEnabled,
      d.is_deleted AS isDeleted, d.created_at AS createdAt
      FROM dish d LEFT JOIN category c ON d.cate_id = c.cate_id WHERE 1=1`;
    let countSql = `SELECT COUNT(*) AS total FROM dish d WHERE 1=1`;
    const paramsArr: any[] = [];
    const countParams: any[] = [];

    if (isDeleted !== undefined) {
      sql += ` AND d.is_deleted = ?`;
      countSql += ` AND d.is_deleted = ?`;
      paramsArr.push(isDeleted);
      countParams.push(isDeleted);
    }
    if (cateId) {
      sql += ` AND d.cate_id = ?`;
      countSql += ` AND d.cate_id = ?`;
      paramsArr.push(cateId);
      countParams.push(cateId);
    }
    if (keyword) {
      sql += ` AND (d.name LIKE ? OR d.description LIKE ?)`;
      countSql += ` AND (d.name LIKE ? OR d.description LIKE ?)`;
      paramsArr.push(`%${keyword}%`, `%${keyword}%`);
      countParams.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ` ORDER BY d.created_at DESC LIMIT ? OFFSET ?`;
    paramsArr.push(size, (page - 1) * size);

    const [list, countResult] = await Promise.all([
      this.dishRepository.query(sql, paramsArr),
      this.dishRepository.query(countSql, countParams),
    ]);

    const total = countResult[0]?.total || 0;

    // 处理活动价逻辑
    const now = new Date();
    const processedList = list.map((dish: any) => {
      const isActivity =
        dish.activityPrice !== null &&
        dish.activityStart &&
        dish.activityEnd &&
        now >= new Date(dish.activityStart) &&
        now <= new Date(dish.activityEnd);
      return { ...dish, isActivity };
    });

    return { list: processedList, total, page, size };
  }

  async findOne(dishId: number) {
    const rows = await this.dishRepository.query(
      `SELECT d.dish_id AS dishId, d.name, d.price, d.activity_price AS activityPrice,
       d.activity_start AS activityStart, d.activity_end AS activityEnd,
       d.image_url AS imageUrl, d.description, d.cate_id AS cateId,
       c.name AS cateName, d.comment_enabled AS commentEnabled,
       d.created_at AS createdAt
       FROM dish d LEFT JOIN category c ON d.cate_id = c.cate_id
       WHERE d.dish_id = ? AND d.is_deleted = 0`,
      [dishId]
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundException('菜品不存在');
    }

    const dish = rows[0];
    const now = new Date();
    const isActivity =
      dish.activityPrice !== null &&
      dish.activityStart &&
      dish.activityEnd &&
      now >= new Date(dish.activityStart) &&
      now <= new Date(dish.activityEnd);

    return { ...dish, isActivity };
  }

  async create(dto: CreateDishDto) {
    const dish = this.dishRepository.create(dto);
    return this.dishRepository.save(dish);
  }

  async update(dishId: number, dto: UpdateDishDto) {
    const dish = await this.dishRepository.findOne({ where: { dishId } });
    if (!dish) {
      throw new NotFoundException('菜品不存在');
    }
    Object.assign(dish, dto);
    return this.dishRepository.save(dish);
  }

  async remove(dishId: number) {
    const dish = await this.dishRepository.findOne({ where: { dishId } });
    if (!dish) {
      throw new NotFoundException('菜品不存在');
    }
    dish.isDeleted = 1;
    return this.dishRepository.save(dish);
  }

  async restore(dishId: number) {
    const dish = await this.dishRepository.findOne({ where: { dishId } });
    if (!dish) {
      throw new NotFoundException('菜品不存在');
    }
    dish.isDeleted = 0;
    return this.dishRepository.save(dish);
  }

  async permanentDelete(dishId: number) {
    const dish = await this.dishRepository.findOne({ where: { dishId } });
    if (!dish) {
      throw new NotFoundException('菜品不存在');
    }
    await this.dishRepository.remove(dish);
    return { message: '删除成功' };
  }

  async findAllCategories() {
    return this.categoryRepository.query(
      'SELECT cate_id AS cateId, name, sort FROM category ORDER BY sort ASC'
    );
  }

  async getCurrentPrice(dishId: number): Promise<number> {
    const rows = await this.dishRepository.query(
      `SELECT price, activity_price AS activityPrice,
       activity_start AS activityStart, activity_end AS activityEnd
       FROM dish WHERE dish_id = ?`,
      [dishId]
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundException('菜品不存在');
    }

    const dish = rows[0];
    const now = new Date();
    const isActivity =
      dish.activityPrice !== null &&
      dish.activityStart &&
      dish.activityEnd &&
      now >= new Date(dish.activityStart) &&
      now <= new Date(dish.activityEnd);

    return isActivity ? dish.activityPrice : dish.price;
  }
}
