import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { BlogCategory } from './entities/blog-category.entity';
import { BlogService } from './blog.service';
import { BlogCategoryService } from './blog-category.service';

@Module({
	imports: [TypeOrmModule.forFeature([Blog, BlogCategory])],
	providers: [BlogService, BlogCategoryService],
	exports: [BlogService, BlogCategoryService],
})
export class BlogModule {}
