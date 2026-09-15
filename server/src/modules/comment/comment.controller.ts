import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

class CreateCommentDto {
  @IsInt()
  dishId: number;

  @IsString()
  content: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsInt()
  parentId?: number;
}

@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('dishes/:dishId/comments')
  async findByDishId(
    @Param('dishId') dishId: number,
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    return this.commentService.findByDishId(dishId, user, { page, size });
  }

  @Post('comments')
  @Roles('customer', 'admin')
  async create(
    @CurrentUser('uid') uid: number,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentService.create(
      uid,
      dto.dishId,
      dto.content,
      dto.rating,
      dto.parentId,
    );
  }

  @Post('admin/comments/:id/delete')
  @Roles('admin')
  async remove(
    @Param('id') id: number,
    @CurrentUser('uid') adminUid: number,
  ) {
    return this.commentService.removeAsAdmin(id, adminUid);
  }

  @Post('admin/comments/:id/top')
  @Roles('admin')
  async toggleTop(
    @Param('id') id: number,
    @CurrentUser('uid') adminUid: number,
    @Body('is_top') isTop: number,
  ) {
    return this.commentService.toggleTopAsAdmin(id, adminUid, isTop);
  }
}
