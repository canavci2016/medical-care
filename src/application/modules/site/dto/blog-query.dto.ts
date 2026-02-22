import { IsOptional, IsString, IsNumberString, IsUUID } from 'class-validator';

export class BlogQueryDto {
  [key: string]: string | undefined;

  @IsOptional()
  @IsUUID()
  cat?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsString()
  title?: string;
}
