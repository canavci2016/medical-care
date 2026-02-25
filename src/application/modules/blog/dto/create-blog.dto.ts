import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { BlogStatus } from '../entities/blog.entity';

export class CreateBlogDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  excerpt: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  featuredImage?: string;

  @IsString()
  metaTitle: string;

  @IsString()
  metaDescription: string;

  @IsArray()
  @IsString({ each: true })
  metaKeywords: string[];

  @IsEnum(BlogStatus)
  status: BlogStatus;

  @IsBoolean()
  isFeatured: boolean;

  @IsDateString()
  publishedAt: Date;

  @IsUUID()
  categoryId: string;

  @IsInt()
  @Min(0)
  viewCount: number;

  @IsInt()
  @Min(0)
  readingTime: number;
}
