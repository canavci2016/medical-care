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
    const {
      pagination: { total: hospitalCount },
      data: hospitals,
    } = await this.hospitalService.paginated({
      orderBy: 'createdAt',
      orderDirection: 'desc',
      page: { limit: 3, page: 1 },
    });

    const {
      data: randomHairResults,
      pagination: { total: hairResultCount },
    } = await this.hospitalHairResultService.findAll({
      random: true,
      page: { limit: 3, page: 1 },
    });

    const randomHospitals = await this.hospitalService.findAll({
      id: randomHairResults.map((r) => r.hospitalId),
    });

    const results = randomHairResults.map((result) => ({
      id: result.id,
      hospital: randomHospitals.find((h) => h.id === result.hospitalId) || null,
      verified: result.verified,
      graftCount: result.graftCount,
      image: result?.images[0]?.imageUrl || null,
    }));

    const reviews: any[] = [];
    for (const hospital of hospitals) {
      reviews.push(...(hospital.reviews || []));
    }

    for (const hospital of randomHospitals) {
      reviews.push(...(hospital.reviews || []));
    }

    return res.render('index', {
      currentPage: 'home',
      hospitalCount,
      hospitals,
      results,
      hairResultCount,
      reviews: reviews.filter((r) => r!.comment).slice(0, 3),
      seo: {
        title: 'Real Hair Transplant Results | Medical Care',
        keywords:
          'hair transplant results, before after hair transplant, FUE results, DHI results, verified clinic outcomes',
        description:
          'Find real hair transplant before-and-after results from trusted clinics. Search by hospital, technique, and treatment timeline.',
        canonical: '/',
        ogType: 'website',
        ogTitle: 'Real Hair Transplant Results | Medical Care',
        ogDescription:
          'Explore authentic hair transplant outcomes and compare results by clinic and technique.',
        ogUrl: '/',
        twitterTitle: 'Real Hair Transplant Results | Medical Care',
        twitterDescription:
          'Discover real before-and-after hair transplant cases from trusted clinics.',
      },
    });
  }
}
