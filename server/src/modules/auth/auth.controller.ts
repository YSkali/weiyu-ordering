import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AccountLoginDto } from './dto/account-login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(
      loginDto.code,
      loginDto.nickname,
      loginDto.avatar,
    );
  }

  @Public()
  @Post('account-login')
  async accountLogin(@Body() dto: AccountLoginDto) {
    return this.authService.accountLogin(dto.account, dto.password, dto.groupCode);
  }

  @Get('me')
  async getProfile(@CurrentUser('uid') uid: number) {
    return this.authService.getProfile(uid);
  }
}
