import { Controller, Get, Post, Put, Body, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserService } from './user.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('sign-in')
  async signIn(@CurrentUser('uid') uid: number) {
    return this.userService.signIn(uid);
  }

  @Get('points/flow')
  async getPointsFlow(
    @CurrentUser('uid') uid: number,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    return this.userService.getPointsFlow(uid, { page, size });
  }

  // 上传头像
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (_req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|jpg|gif|webp)$/)) {
          cb(new Error('只支持图片格式'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser('uid') uid: number,
    @UploadedFile() file: any,
  ) {
    return this.userService.uploadAvatar(uid, file);
  }

  // 更新个人资料（昵称等）
  @Put('profile')
  async updateProfile(
    @CurrentUser('uid') uid: number,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(uid, dto);
  }

  // 修改登录账号
  @Put('account')
  async changeAccount(
    @CurrentUser('uid') uid: number,
    @Body() dto: { account: string; password: string },
  ) {
    return this.userService.changeAccount(uid, dto.account, dto.password);
  }

  // 修改密码
  @Put('password')
  async changePassword(
    @CurrentUser('uid') uid: number,
    @Body() dto: { oldPassword: string; newPassword: string },
  ) {
    return this.userService.changePassword(uid, dto.oldPassword, dto.newPassword);
  }

  // 管理员设置/修改分组口令
  @Post('group-code')
  async setGroupCode(
    @CurrentUser('uid') uid: number,
    @Body('groupCode') groupCode: string,
  ) {
    return this.userService.setGroupCode(uid, groupCode);
  }
}
