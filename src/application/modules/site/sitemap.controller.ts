import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { RedisService } from 'src/application/core/redis/redis.service';
import { BlogService } from '../blog/blog.service';
import { BlogStatus } from '../blog/entities/blog.entity';
import { HospitalService } from '../hospital/hospital.service';
import { HospitalHairResultService } from '../hospital-hair-result/hospital-hair-result.service';
import { GraftCountEnum } from '../hospital-hair-result/entities/hospital-hair-result.entity';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';

interface XmlUrl {
  loc: string;
  changefreq: string;
  priority: string;
}

@Controller()
export class SitemapController {
  private readonly CACHE_KEY = 'sitemap_xml';
  private readonly CACHE_TTL_SECONDS = 5 * 60 * 60; // 5 hours

  constructor(
    private readonly redisService: RedisService,
    private readonly blogService: BlogService,
    private readonly hospitalService: HospitalService,
    private readonly hospitalHairResultService: HospitalHairResultService,
  ) { }

  @Get('sitemap.xml')
  async getSitemap(@Res() res: Response) {
    const cached = await this.redisService.get<string>(this.CACHE_KEY);

    const baseUrl = process.env.APP_URL || 'https://hairresult.com';
    const today = new Date().toISOString().split('T')[0];

    const staticUrls: Array<XmlUrl> = [
      { loc: '/', changefreq: 'daily', priority: '1.0' },
      { loc: '/clinics', changefreq: 'daily', priority: '0.9' },
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

    const listOfGraftCounts = Object.values(GraftCountEnum);
    const listOfTechniques = Object.values(HairTransplantTechnique);
    const blogUrls = blogs.map((blog) => ({
      loc: `/blogs/${blog.slug}`,
      changefreq: 'weekly',
      priority: '0.7',
    }));
    const resultUrls = hairResults.data.map((result) => ({
      loc: `/results/${result.id}`,
      changefreq: 'monthly',
      priority: '0.6',
    }));
    const hospitalUrls: Array<XmlUrl> = [];

    for (const technique of listOfTechniques) {
      resultUrls.push({
        loc: `/${technique.toLowerCase()}-hair-transplant-results`,
        changefreq: 'weekly',
        priority: '0.8',
      });
    }

    for (const graft of listOfGraftCounts) {
      resultUrls.push({
        loc: `/results/${graft}-grafts`,
        changefreq: 'weekly',
        priority: '0.8',
      });
    }

    for (const hospital of hospitals) {
      hospitalUrls.push({
        loc: `/clinics/${hospital.slug}`,
        changefreq: 'weekly',
        priority: '0.8',
      });

      resultUrls.push({
        loc: `/clinics/${hospital.slug}/results`,
        changefreq: 'weekly',
        priority: '0.8',
      });

      for (const graft of listOfGraftCounts) {
        for (const technique of listOfTechniques) {
          resultUrls.push({
            loc: `/results/${hospital.slug}-${graft}-grafts-${technique}-12-months`,
            changefreq: 'weekly',
            priority: '0.8',
          });
        }
      }
    }

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

    await this.redisService.set(this.CACHE_KEY, xml, this.CACHE_TTL_SECONDS);

    res.header('Content-Type', 'application/xml');
    return res.send(xml);
  }
}
