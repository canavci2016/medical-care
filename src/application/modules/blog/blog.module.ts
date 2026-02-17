import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { BlogCategory } from './entities/blog-category.entity';
import { BlogTag } from './entities/blog-tag.entity';
import { BlogService } from './blog.service';
import { BlogCategoryService } from './blog-category.service';
import { BlogTagService } from './blog-tag.service';

@Module({
	imports: [TypeOrmModule.forFeature([Blog, BlogCategory, BlogTag])],
	providers: [BlogService, BlogCategoryService, BlogTagService],
	exports: [BlogService, BlogCategoryService, BlogTagService],
})
export class BlogModule {}
