import { IsString, IsOptional } from 'class-validator';

export class AccountLoginDto {
  @IsString()
  account: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  groupCode?: string;
}
