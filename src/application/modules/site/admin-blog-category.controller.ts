import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BlogCategoryService } from '../blog/blog-category.service';
import { BlogCategory } from '../blog/entities/blog-category.entity';
import type { Response } from 'express';
import { AdminAuthGuard } from './guards/admin-auth.guard';

@UseGuards(AdminAuthGuard)
@Controller('admin/blog-categories')
export class AdminBlogCategoryController {
  constructor(private readonly blogCategoryService: BlogCategoryService) {}

  @Get()
  async findAll(@Res() res: Response) {
    const categories = await this.blogCategoryService.findAll({
      orderBy: 'name',
      order: 'ASC',
    });

    return res.render('admin/blog-categories', {
      categories,
      styles: ['create-blog.css'],
      layout: false,
    });
  }

  @Get('create')
  createForm(@Res() res: Response) {
    return res.render('admin/create-blog-category', {
      styles: ['create-blog.css'],
      layout: false,
    });
  }

  @Get(':id/detail')
  async detailPage(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const category = await this.blogCategoryService.findOne(id);

    return res.render('admin/blog-category-detail', {
      category,
      styles: ['create-blog.css'],
      layout: false,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.blogCategoryService.findOne(id);
  }

  @Post()
  async create(@Body() payload: Partial<BlogCategory>) {
    return this.blogCategoryService.create({
      name: payload.name,
      slug: payload.slug,
    });
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: Partial<BlogCategory>,
  ) {
    return this.blogCategoryService.update(id, {
      name: payload.name,
      slug: payload.slug,
    });
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.blogCategoryService.remove(id);
    return { success: true };
  }
}
