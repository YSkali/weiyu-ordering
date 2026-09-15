import {
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateDishDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  activityPrice?: number;

  @IsOptional()
  @IsDateString()
  activityStart?: string;

  @IsOptional()
  @IsDateString()
  activityEnd?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  imageUrl: string;

  @IsInt()
  cateId: number;

  @IsOptional()
  @IsInt()
  visibility?: number;

  @IsOptional()
  @IsInt()
  commentEnabled?: number;
}
