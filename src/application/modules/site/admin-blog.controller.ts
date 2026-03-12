import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Put,
  Res,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from '../blog/blog.service';
import { Blog, BlogStatus } from '../blog/entities/blog.entity';
import { CreateBlogDto } from '../blog/dto/create-blog.dto';
import { BlogCategory } from '../blog/entities/blog-category.entity';
import { BlogCategoryService } from '../blog/blog-category.service';
import type { Response } from 'express';
import { BlogQueryDto } from './dto/blog-query.dto';
import { buildPagination } from './pagination.util';
import { AdminAuthGuard } from './guards/admin-auth.guard';

@UseGuards(AdminAuthGuard)
@Controller('admin/blogs')
export class AdminBlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly blogCategoryService: BlogCategoryService,
  ) {}

  @Get()
  async findAll(@Res() res: Response, @Query() query: BlogQueryDto) {
    const { data: blogs, pagination } = await this.blogService.paginated({
      page: {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: 20,
      },
      orderBy: 'publishedAt',
      order: 'DESC',
      status: BlogStatus.PUBLISHED,
    });

    const newPagination = buildPagination(pagination, query);

    return res.render('admin/blogs', {
      blogs,
      styles: ['blogs.css'],
      layout: false,
      pagination: newPagination,
    });
  }
  @Get('create')
  async createForm(@Res() res: Response) {
    const categories = await this.blogCategoryService.findAll({
      orderBy: 'name',
      order: 'ASC',
    });

    return res.render('admin/create-blog', {
      categories,
      styles: ['create-blog.css'],
      layout: false,
    });
  }

  @Get(':id/detail')
  async detailPage(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const blog = await this.blogService.findOneBy({ id });
    const categories = await this.blogCategoryService.findAll({
      orderBy: 'name',
      order: 'ASC',
    });

    return res.render('admin/blog-detail', {
      blog,
      categories,
      styles: ['create-blog.css'],
      layout: false,
    });
  }

  @Post()
  async create(@Body() createBlogDto: CreateBlogDto) {
    const { categoryId, ...rest } = createBlogDto;

    return this.blogService.create({
      ...rest,
      category: { id: categoryId } as BlogCategory,
    });
  }

  @Post('upload-url')
  getUploadUrl(@Body('contentType') contentType: string) {
    return this.blogService.generateUploadUrl(contentType);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBlogDto: Partial<Blog> & { categoryId?: string },
  ) {
    const { categoryId, ...rest } = updateBlogDto;
    const blog = await this.blogService.findOneBy({ id });

    Object.assign(blog, rest);

    if (categoryId) {
      blog.category = { id: categoryId } as BlogCategory;
    }

    return this.blogService.create(blog);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    const blog = await this.blogService.findOneBy({ id });
    return this.blogService.create({ ...blog, deletedAt: new Date() });
  }
}
