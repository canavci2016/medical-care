import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Controller, Get, Inject, Param, Query, Res } from '@nestjs/common';
import { BlogService } from '../blog/blog.service';
import { BlogStatus } from '../blog/entities/blog.entity';
import type { Cache } from 'cache-manager';
import type { Response } from 'express';
import { BlogCategoryService } from '../blog/blog-category.service';
import { buildPagination } from './pagination.util';
import { BlogQueryDto } from './dto/blog-query.dto';

@Controller('blogs')
export class BlogController {
  private readonly BLOG_LIST_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
  private readonly cacheManager!: Cache;

  constructor(
    private readonly blogService: BlogService,
    private readonly categoryService: BlogCategoryService,
    @Inject(CACHE_MANAGER) cacheManager: unknown,
  ) {
    this.cacheManager = cacheManager as Cache;
  }

  private buildBlogListCacheKey(query: BlogQueryDto) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const category = query.cat || '';
    const title = (query.title || '').trim().toLowerCase();

    return `blog_list:page=${page}:cat=${category}:title=${encodeURIComponent(title)}`;
  }

  @Get()
  async findAll(@Res() res: Response, @Query() query: BlogQueryDto) {
    const cacheKey = this.buildBlogListCacheKey(query);
    const cachedHtml = await this.cacheManager.get<string>(cacheKey);
    if (cachedHtml) {
      return res.send(cachedHtml);
    }

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
      skip: blogs.length - 1 < 0 ? 0 : blogs.length - 1,
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

    const viewModel = {
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
    };

    const renderedHtml = await new Promise<string>((resolve, reject) => {
      res.render('blogs', viewModel, (error, html) => {
        if (error || !html) {
          reject(error || new Error('Failed to render blogs page'));
          return;
        }

        resolve(html);
      });
    });

    await this.cacheManager.set(
      cacheKey,
      renderedHtml,
      this.BLOG_LIST_CACHE_TTL_MS,
    );

    return res.send(renderedHtml);
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
