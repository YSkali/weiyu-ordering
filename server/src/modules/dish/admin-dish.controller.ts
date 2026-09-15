import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { DishService } from './dish.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('admin/dishes')
@Roles('admin')
export class AdminDishController {
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
    });
  }

  @Post()
  async create(@Body() dto: CreateDishDto) {
    return this.dishService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateDishDto) {
    return this.dishService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.dishService.remove(id);
  }

  @Put(':id/restore')
  async restore(@Param('id') id: number) {
    return this.dishService.restore(id);
  }

  @Delete(':id/permanent')
  async permanentDelete(@Param('id') id: number) {
    return this.dishService.permanentDelete(id);
  }
}
