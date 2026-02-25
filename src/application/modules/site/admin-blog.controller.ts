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
} from '@nestjs/common';
import { BlogService } from '../blog/blog.service';
import { Blog, BlogStatus } from '../blog/entities/blog.entity';
import { CreateBlogDto } from '../blog/dto/create-blog.dto';
import { BlogCategory } from '../blog/entities/blog-category.entity';
import type { Response } from 'express';
import { BlogQueryDto } from './dto/blog-query.dto';
import { buildPagination } from './pagination.util';

@Controller('admin/blogs')
export class AdminBlogController {
  constructor(private readonly blogService: BlogService) { }

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
  createForm(@Res() res: Response) {
    return res.render('admin/create-blog', {
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

    return res.render('admin/blog-detail', {
      blog,
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
    @Body() updateBlogDto: Partial<Blog>,
  ) {
    const blog = await this.blogService.findOneBy({ id });
    Object.assign(blog, updateBlogDto);
    return this.blogService.create(blog);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    const blog = await this.blogService.findOneBy({ id });
    return this.blogService.create({ ...blog, deletedAt: new Date() });
  }
}
