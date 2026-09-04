import { Controller, Get, Header, Res, Param } from '@nestjs/common';
import type { Response } from 'express';
import { SitemapService } from './sitemap.service';

@Controller()
export class SitemapController {
  constructor(private readonly sitemapService: SitemapService) { }

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  getSitemap() {
    return this.sitemapService.getSitemapIndexXml();
  }

  @Get('sitemaps/results-for-hospitals.xml')
  @Header('Content-Type', 'application/xml')
  async resultsForHospitalsSitemap(@Res() res: Response) {
    const xml = await this.sitemapService.getResultsForHospitalsSitemapXml();
    res.header('Content-Type', 'application/xml');
    return res.send(xml);
  }

  @Get('sitemaps/results-:page.xml')
  @Header('Content-Type', 'application/xml')
  async resultSitemap(@Res() res: Response, @Param('page') page: number) {
    const xml = await this.sitemapService.getResultsSitemapXml(page);
    res.header('Content-Type', 'application/xml');
    return res.send(xml);
  }

  @Get('sitemaps/static.xml')
  @Header('Content-Type', 'application/xml')
  staticSitemap() {
    return this.sitemapService.getStaticSitemapXml();
  }

  @Get('sitemaps/hospital.xml')
  @Header('Content-Type', 'application/xml')
  hospitalSitemap() {
    return this.sitemapService.getHospitalSitemapXml();
  }

  @Get('sitemaps/hospital-of-city.xml')
  @Header('Content-Type', 'application/xml')
  hospitalOfCitySitemap() {
    return this.sitemapService.getHospitalOfCitySitemapXml();
  }

  @Get('sitemaps/blog.xml')
  @Header('Content-Type', 'application/xml')
  blogSitemap() {
    return this.sitemapService.getBlogSitemapXml();
  }
}
