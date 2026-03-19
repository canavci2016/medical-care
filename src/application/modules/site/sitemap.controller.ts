import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { BlogService } from '../blog/blog.service';
import { BlogStatus } from '../blog/entities/blog.entity';
import { HospitalService } from '../hospital/hospital.service';
import { HospitalHairResultService } from '../hospital-hair-result/hospital-hair-result.service';

@Controller()
export class SitemapController {
  constructor(
    private readonly blogService: BlogService,
    private readonly hospitalService: HospitalService,
    private readonly hospitalHairResultService: HospitalHairResultService,
  ) {}

  @Get('sitemap.xml')
  async getSitemap(@Res() res: Response) {
    const baseUrl = process.env.APP_URL || 'https://medicalcare.com';
    const today = new Date().toISOString().split('T')[0];

    const staticUrls: Array<{
      loc: string;
      changefreq: string;
      priority: string;
    }> = [
      { loc: '/', changefreq: 'daily', priority: '1.0' },
      { loc: '/hospitals', changefreq: 'daily', priority: '0.9' },
      { loc: '/results', changefreq: 'daily', priority: '0.9' },
      { loc: '/blogs', changefreq: 'weekly', priority: '0.8' },
      { loc: '/about', changefreq: 'monthly', priority: '0.5' },
    ];

    const [blogs, hospitals, hairResults] = await Promise.all([
      this.blogService.findAll({
        status: BlogStatus.PUBLISHED,
        take: 10000,
      }),
      this.hospitalService.findAll({ take: 10000 }),
      this.hospitalHairResultService.findAll({
        page: { page: 1, limit: 10000 },
      }),
    ]);

    const blogUrls = blogs.map((blog) => ({
      loc: `/blogs/${blog.slug}`,
      changefreq: 'weekly',
      priority: '0.7',
    }));

    const hospitalUrls = hospitals.map((hospital) => ({
      loc: `/hospitals/${hospital.id}`,
      changefreq: 'weekly',
      priority: '0.8',
    }));

    const resultUrls = hairResults.data.map((result) => ({
      loc: `/results/${result.id}`,
      changefreq: 'monthly',
      priority: '0.6',
    }));

    const allUrls = [
      ...staticUrls,
      ...blogUrls,
      ...hospitalUrls,
      ...resultUrls,
    ];

    const xmlEntries = allUrls
      .map(
        (url) => `  <url>
    <loc>${baseUrl}${url.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
      )
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    return res.send(xml);
  }
}
