import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/application/core/redis/redis.service';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';
import { BlogService } from '../blog/blog.service';
import { BlogStatus } from '../blog/entities/blog.entity';
import { HospitalHairResultService } from '../hospital-hair-result/hospital-hair-result.service';
import { GraftCountEnum } from '../hospital-hair-result/entities/hospital-hair-result.entity';
import { HospitalService } from '../hospital/hospital.service';
import { CityService } from 'src/application/shared/modules/city/city.service';

interface XmlUrl {
  loc: string;
  changefreq: string;
  priority: string;
}

@Injectable()
export class SitemapService {
  private readonly appBaseUrl = process.env.APP_URL || 'https://hairresult.com';
  private readonly NUMBER_OF_RESULTS_PER_PAGE = 50;

  constructor(
    private readonly redisService: RedisService,
    private readonly blogService: BlogService,
    private readonly hospitalService: HospitalService,
    private readonly hospitalHairResultService: HospitalHairResultService,
    private readonly cityService: CityService,
  ) { }

  async getSitemapIndexXml(): Promise<string> {
    const hairResults = await this.hospitalHairResultService.findAll({
      page: { page: 1, limit: this.NUMBER_OF_RESULTS_PER_PAGE },
    });

    const allUrls = [
      '/sitemaps/static.xml',
      '/sitemaps/hospital.xml',
      '/sitemaps/blog.xml',
      '/sitemaps/results-for-hospitals.xml',
      '/sitemaps/hospital-of-city.xml',
      ...Array.from(
        Array(hairResults.pagination.totalPages),
        (_, x) => `/sitemaps/results-${x + 1}.xml`,
      ),
    ];

    const xmlEntries = allUrls
      .map(
        (url) => `<sitemap>
    <loc>${this.appBaseUrl}${url}</loc>
  </sitemap>`,
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</sitemapindex>`;
  }

  async getResultsSitemapXml(page: number): Promise<string> {
    const today = new Date().toISOString().split('T')[0];

    const { data: hairResults, pagination } =
      await this.hospitalHairResultService.findAll({
        page: { page, limit: this.NUMBER_OF_RESULTS_PER_PAGE },
      });
    const resultUrls = hairResults.map((result) => ({
      loc: `/results/${result.id}`,
      changefreq: 'monthly',
      priority: '0.6',
    }));

    const xml = this.toUrlsetXml(resultUrls, today);

    return xml;
  }

  async getResultsForHospitalsSitemapXml(): Promise<string> {

    const today = new Date().toISOString().split('T')[0];

    const hospitals = await this.hospitalService.findAll({ take: 10000 });

    const listOfGraftCounts = Object.values(GraftCountEnum);
    const listOfTechniques = Object.values(HairTransplantTechnique);
    const resultUrls: Array<XmlUrl> = [];

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
      if (!hospital.slug) {
        continue;
      }

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

    const xml = this.toUrlsetXml(resultUrls, today);

    return xml;
  }

  getStaticSitemapXml(): string {
    const staticUrls: Array<XmlUrl> = [
      { loc: '/', changefreq: 'daily', priority: '1.0' },
      { loc: '/clinics', changefreq: 'daily', priority: '0.9' },
      { loc: '/results', changefreq: 'daily', priority: '0.9' },
      { loc: '/blogs', changefreq: 'weekly', priority: '0.8' },
      { loc: '/about', changefreq: 'monthly', priority: '0.5' },
    ];

    const today = new Date().toISOString().split('T')[0];
    return this.toUrlsetXml(staticUrls, today);
  }

  async getHospitalSitemapXml(): Promise<string> {
    const hospitals = await this.hospitalService.findAll({ take: 10000 });
    const urls: Array<XmlUrl> = hospitals
      .filter((hospital) => !!hospital.slug)
      .map((hospital) => ({
        loc: `/clinics/${hospital.slug}`,
        changefreq: 'daily',
        priority: '0.9',
      }));

    const today = new Date().toISOString().split('T')[0];
    return this.toUrlsetXml(urls, today);
  }

  async getHospitalOfCitySitemapXml(): Promise<string> {
    const cities = await this.cityService.findAll({ take: 10000 });
    const urls: Array<XmlUrl> = cities
      .filter((city) => !!city.slug)
      .map((city) => ({
        loc: `/hair-transplant/${city.slug}/clinics`,
        changefreq: 'daily',
        priority: '0.9',
      }));

    const today = new Date().toISOString().split('T')[0];
    return this.toUrlsetXml(urls, today);
  }

  async getBlogSitemapXml(): Promise<string> {
    const blogs = await this.blogService.findAll({
      status: BlogStatus.PUBLISHED,
      take: 10000,
    });
    const urls: Array<XmlUrl> = blogs.map((blog) => ({
      loc: `/blogs/${blog.slug}`,
      changefreq: 'daily',
      priority: '0.9',
    }));

    const today = new Date().toISOString().split('T')[0];
    return this.toUrlsetXml(urls, today);
  }

  private toUrlsetXml(urls: Array<XmlUrl>, today: string): string {
    const xmlEntries = urls
      .map((url) => {
        return `  <url>
    <loc>${this.appBaseUrl}${url.loc}</loc>
    <lastmod>${today}</lastmod>
  </url>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;
  }
}
