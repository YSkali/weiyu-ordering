import { Controller, Get, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('admin/users')
@Roles('admin')
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(
    @CurrentUser('uid') adminUid: number,
    @Query('page') page?: number,
    @Query('size') size?: number,
    @Query('keyword') keyword?: string,
  ) {
    return this.userService.findAllAdmin(adminUid, { page, size, keyword });
  }

  @Put(':uid/points')
  async adjustPoints(
    @CurrentUser('uid') adminUid: number,
    @Param('uid') uid: number,
    @Body('change') change: number,
    @Body('remark') remark: string,
  ) {
    return this.userService.adjustPoints(adminUid, uid, change, remark);
  }

  @Delete(':uid')
  async deleteCustomer(
    @CurrentUser('uid') adminUid: number,
    @Param('uid') customerUid: number,
  ) {
    return this.userService.deleteCustomer(adminUid, customerUid);
  }

  @Put(':uid/ban')
  async banCustomer(
    @CurrentUser('uid') adminUid: number,
    @Param('uid') customerUid: number,
  ) {
    return this.userService.banCustomer(adminUid, customerUid);
  }

  @Put(':uid/unban')
  async unbanCustomer(
    @CurrentUser('uid') adminUid: number,
    @Param('uid') customerUid: number,
  ) {
    return this.userService.unbanCustomer(adminUid, customerUid);
  }
}
