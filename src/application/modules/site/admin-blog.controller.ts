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
} from '@nestjs/common';
import { BlogService } from '../blog/blog.service';
import { Blog } from '../blog/entities/blog.entity';
import type { Response } from 'express';

@Controller('admin/blogs')
export class AdminBlogController {
  constructor(private readonly blogService: BlogService) { }

  @Get()
  async findAll(@Res() res: Response) {
    const blogs = await this.blogService.findAll({
      orderBy: 'createdAt',
      order: 'DESC',
    });
    return res.render('admin/blogs', {
      blogs,
      styles: ['blogs.css'],
      layout: false,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.blogService.findOneBy({ id });
  }

  @Post()
  async create(@Body() createBlogDto: Partial<Blog>) {
    return this.blogService.create(createBlogDto);
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
