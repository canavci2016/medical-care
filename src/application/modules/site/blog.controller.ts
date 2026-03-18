import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { BlogService } from '../blog/blog.service';
import { BlogStatus } from '../blog/entities/blog.entity';
import type { Response } from 'express';
import { BlogCategoryService } from '../blog/blog-category.service';
import { buildPagination } from './pagination.util';
import { BlogQueryDto } from './dto/blog-query.dto';

@Controller('blogs')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly categoryService: BlogCategoryService,
  ) {}

  @Get()
  async findAll(@Res() res: Response, @Query() query: BlogQueryDto) {
    const { data: blogs, pagination } = await this.blogService.paginated({
      page: {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: 5,
      },
      orderBy: 'publishedAt',
      order: 'DESC',
      categoryId: query.cat,
      status: BlogStatus.PUBLISHED,
      title: query.title,
    });

    const recentBlogs = await this.blogService.findAll({
      skip: blogs.length - 1,
      take: 3,
      orderBy: 'publishedAt',
      order: 'DESC',
      status: BlogStatus.PUBLISHED,
    });

    const categories = await this.categoryService.findAll({
      orderBy: 'name',
      order: 'ASC',
    });

    const newPagination = buildPagination(pagination, query);

    return res.render('blogs', {
      blogs: blogs,
      categories: categories,
      recentBlogs: recentBlogs,
      pagination: newPagination,
      styles: ['blogs.css'],
      seo: {
        title: 'Hair Transplant Blog | Medical Care',
        keywords:
          'hair transplant blog, hair restoration guides, FUE tips, DHI articles, post transplant care',
        description:
          'Read expert blog articles on hair transplant techniques, recovery, and clinic guidance.',
        canonical: '/blogs',
        ogType: 'website',
        ogTitle: 'Hair Transplant Blog | Medical Care',
        ogDescription:
          'Educational content on hair transplant planning, procedures, and aftercare.',
        ogUrl: '/blogs',
        twitterTitle: 'Hair Transplant Blog | Medical Care',
        twitterDescription:
          'Discover practical hair transplant guides and expert insights.',
      },
    });
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string, @Res() res: Response) {
    const blog = await this.blogService.findOneBy({ slug });
    const categories = await this.categoryService.findAll({
      orderBy: 'name',
      order: 'ASC',
    });

    const recentBlogs = await this.blogService.findAll({
      skip: 0,
      take: 3,
      orderBy: 'publishedAt',
      order: 'DESC',
      status: BlogStatus.PUBLISHED,
    });

    const popularBlogs = await this.blogService.findAll({
      skip: 0,
      take: 3,
      orderBy: 'viewCount',
      order: 'DESC',
      status: BlogStatus.PUBLISHED,
    });

    return res.render('blog-detail', {
      blog,
      categories,
      recentBlogs,
      popularBlogs,
      styles: ['blog-detail.css'],
    });
  }
}
