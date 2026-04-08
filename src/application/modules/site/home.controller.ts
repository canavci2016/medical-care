import { Controller, Get, Res } from '@nestjs/common';
import { HomeService } from './home.service';
import type { Response } from 'express';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';
import { HospitalService } from '../hospital/hospital.service';

@Controller('/')
export class HomeController {
  constructor(
    private readonly hospitalService: HospitalService,
    private readonly homeService: HomeService,
  ) { }

  @Get()
  async getHomeData(@Res() res: Response) {
    const {
      pagination: { total: hospitalCount },
    } = await this.hospitalService.paginated({});
    const latestHairResults = await this.homeService.getLatestHairResults();

    const results = latestHairResults.map((result) => ({
      id: result.id,
      hospital: result.hospital,
      verified: result.verified,
      graftCount: result.graftCount,
      image: result?.images[0]?.imageUrl || null,
    }));

    const techniques = Object.entries(HairTransplantTechnique).map(
      ([key, value]) => ({
        label: key,
        value,
      }),
    );

    const availableMonths = [0, 3, 6, 9, 12].map((month) => ({
      label: month === 0 ? 'Before' : `${month} months after`,
      value: month,
    }));

    return res.render('index', {
      currentPage: 'home',
      hospitalCount,
      results,
      techniques,
      availableMonths,
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
