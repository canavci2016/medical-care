import { IsString, IsOptional, IsBoolean, IsUrl, IsInt, IsEnum, Min } from 'class-validator';

export class CreateImageDto {
  @IsUrl()
  imageUrl: string;

  @IsInt()
  @Min(0)
  month: number; // 0, 1, 3, 6, 12

  @IsOptional()
  @IsBoolean()
  isBefore?: boolean;

  @IsOptional()
  @IsBoolean()
  isAfter?: boolean;

  @IsOptional()
  @IsString()
  @IsEnum(['front', 'left', 'right', 'top'])
  angle?: string;

  @IsOptional()
  @IsString()
  lighting?: string;

  @IsOptional()
  @IsBoolean()
  watermarked?: boolean;
}
