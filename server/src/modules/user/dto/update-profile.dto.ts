import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(16)
  nickname?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
