import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { HospitalService } from '../hospital/hospital.service';
import { HospitalHairResultService } from '../hospital-hair-result/hospital-hair-result.service';

@Controller('/')
export class HomeController {
  constructor(
    private readonly hospitalService: HospitalService,
    private readonly hospitalHairResultService: HospitalHairResultService,
  ) { }

  @Get()
  async getHomeData(@Res() res: Response) {
    const hospitals = await this.hospitalService.paginated({
      orderBy: 'createdAt',
      orderDirection: 'desc',
      page: { limit: 3, page: 1 },
    });

    const results = await this.hospitalHairResultService.findAll({
      orderBy: 'createdAt',
      orderDirection: 'desc',
      page: { limit: 3, page: 1 },
    });

    const reviews: any[] = [];
    for (const hospital of hospitals.data) {
      reviews.push(...(hospital.reviews || []));
    }

    for (const res of results.data) {
      reviews.push(...(res.hospital?.reviews || []));
    }

    return res.render('index', {
      currentPage: 'home',
      hospitals,
      results: results,
      reviews: reviews.filter((r) => r!.comment).slice(0, 3),
      seo: {
        title: 'Real Hair Transplant Results | HairResult',
        keywords:
          'hair transplant in turkey, hair transplant results, before after hair transplant, FUE results, DHI results, verified clinic outcomes',
        description:
          'Find real hair transplant before-and-after results from trusted clinics. Search by hospital, technique, and treatment timeline.',
        canonical: '/',
        ogType: 'website',
        ogTitle: 'Real Hair Transplant Results | HairResult',
        ogDescription:
          'Explore authentic hair transplant outcomes and compare results by clinic and technique.',
        ogUrl: '/',
        twitterTitle: 'Real Hair Transplant Results | HairResult',
        twitterDescription:
          'Discover real before-and-after hair transplant cases from trusted clinics.',
      },
    });
  }
}
