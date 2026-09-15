import { Controller, Get, Param, Query } from '@nestjs/common';
import { DishService } from './dish.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('dishes')
@Public()
export class DishController {
  constructor(private readonly dishService: DishService) {}

  @Get()
  async findAll(
    @Query() pagination: PaginationDto,
    @Query('cate_id') cateId?: number,
  ) {
    return this.dishService.findAll({
      page: pagination.page,
      size: pagination.size,
      cateId,
      keyword: pagination.keyword,
      isDeleted: 0,
    });
  }

  @Get('categories')
  async findAllCategories() {
    return this.dishService.findAllCategories();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.dishService.findOne(id);
  }
}
