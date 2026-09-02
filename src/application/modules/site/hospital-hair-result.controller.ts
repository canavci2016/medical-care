import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
} from '@nestjs/common';
import { HospitalHairResultService } from '../hospital-hair-result/hospital-hair-result.service';
import type { Response } from 'express';
import {
  GraftCountEnum,
  HairProcedureType,
} from '../hospital-hair-result/entities/hospital-hair-result.entity';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';
import { HairResultQueryDto } from './dto/hair-result-query.dto';
import { HospitalService } from '../hospital/hospital.service';

interface SeoParamsInterface {
  title: string;
  h1Title: string;
  keywords: string;
  description: string;
  canonical: string;
  ogType: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  twitterTitle: string;
  twitterDescription: string;
}

@Controller()
export class HospitalHairResultController {
  constructor(
    private readonly hospitalHairResultService: HospitalHairResultService,
    private readonly hospitalService: HospitalService,
  ) { }

  @Get('/results')
  async findAll(@Res() res: Response, @Query() query: HairResultQueryDto) {
    let h1Title = 'Hair Transplant Results';

    if (query.graftCount && query.technique) {
      h1Title = `${query.graftCount} Graft ${query.technique.toUpperCase()} Hair Transplant Result - 12 Months | HairResult`;
    } else if (query.graftCount) {
      h1Title = `${query.graftCount} Graft Hair Transplant Result - 12 Months | HairResult`;
    } else if (query.technique) {
      h1Title = `${query.technique.toUpperCase()} Hair Transplant Result - 12 Months | HairResult`;
    }

    return this.renderResults(query, res, {
      h1Title: h1Title,
    });
  }

  @Get('/clinics/:hospitalSlug/results')
  async findAllForHospital(
    @Res() res: Response,
    @Param('hospitalSlug') hospitalSlug: string,
    @Query() query: HairResultQueryDto,
  ) {
    const hospital = await this.hospitalService.findOneBy({
      slug: hospitalSlug,
    });
    query.hospitalId = hospital.id;
    return this.renderResults(query, res, {
      ogTitle: `${hospital.name} hair transplant results`,
      title: `${hospital.name} hair transplant results`,
      h1Title: `${hospital.name} hair transplant results`,
    });
  }

  @Get('/results/:hospitalSlug-:graftCount-grafts-:technique-:months-months')
  async findAllForMultipleCriteria(
    @Res() res: Response,
    @Query() query: HairResultQueryDto,
    @Param('hospitalSlug') hospitalSlug: string,
    @Param('graftCount') graftCount: string,
    @Param('technique') technique: string,
    @Param('months') months: string,
  ) {
    const baseGraftCount = this.roundDownToThousand(parseInt(graftCount, 10));
    query.graftCount = query.graftCount || baseGraftCount.toString();
    const hospital = await this.hospitalService.findOneBy({
      slug: hospitalSlug,
    });
    query.hospitalId = hospital.id;

    let techniqueValue: HairTransplantTechnique | undefined;

    if (
      Object.values(HairTransplantTechnique).includes(
        technique.toUpperCase() as HairTransplantTechnique,
      )
    ) {
      techniqueValue = technique.toUpperCase() as HairTransplantTechnique;
    }

    query.technique = query.technique || techniqueValue;

    return this.renderResults(query, res, {
      ogTitle: `${graftCount} Graft ${techniqueValue} Hair Transplant Result – ${months} Months`,
      title: `${graftCount} Graft ${techniqueValue} Hair Transplant Result – ${months} Months`,
      h1Title: `${graftCount} Graft ${techniqueValue} Hair Transplant Result`,
    });
  }

  @Get('/:technique-hair-transplant-results')
  async findAllForTechnique(
    @Res() res: Response,
    @Query() query: HairResultQueryDto,
    @Param('technique') technique: string,
  ) {
    let techniqueValue: HairTransplantTechnique | undefined;

    if (
      Object.values(HairTransplantTechnique).includes(
        technique.toUpperCase() as HairTransplantTechnique,
      )
    ) {
      techniqueValue = technique.toUpperCase() as HairTransplantTechnique;
    }

    query.technique = query.technique || techniqueValue;
    return this.renderResults(query, res, {
      ogTitle: `${techniqueValue} Hair Transplant Result`,
      title: `${techniqueValue} Hair Transplant Result`,
      h1Title: `${techniqueValue} Hair Transplant Result`,
    });
  }

  @Get('/:technique-:graftCount-grafts-before-and-after')
  async findAllForTechniqueAndGraftCount(
    @Res() res: Response,
    @Query() query: HairResultQueryDto,
    @Param('technique') technique: string,
    @Param('graftCount') graftCount: string,
  ) {
    let techniqueValue: HairTransplantTechnique | undefined;

    if (
      Object.values(HairTransplantTechnique).includes(
        technique.toUpperCase() as HairTransplantTechnique,
      )
    ) {
      techniqueValue = technique.toUpperCase() as HairTransplantTechnique;
    }

    query.technique = query.technique || techniqueValue;
    query.graftCount =
      query.graftCount ||
      this.roundDownToThousand(parseInt(graftCount, 10)).toString();
    return this.renderResults(query, res, {
      ogTitle: `${graftCount} Graft ${techniqueValue} Before and After Hair Transplant Result`,
      title: `${graftCount} Graft ${techniqueValue} Before and After Hair Transplant Result`,
      h1Title: `${graftCount} Graft ${techniqueValue} Before and After Hair Transplant Result`,
    });
  }

  @Get('/results/:graftCount-grafts')
  async findAllForGrafts(
    @Res() res: Response,
    @Param('graftCount') graftCount: string,
    @Query() query: HairResultQueryDto,
  ) {
    query.graftCount = query.graftCount || graftCount;
    return this.renderResults(query, res, {
      ogTitle: `${graftCount} Graft Transplant Result`,
      title: `${graftCount} Graft Transplant Result`,
      h1Title: `${graftCount} Graft Transplant Result`,
    });
  }

  async renderResults(
    query: HairResultQueryDto,
    @Res() res: Response,
    seo: Partial<SeoParamsInterface> = {},
  ) {
    const { data: latestHairResults, pagination } =
      await this.hospitalHairResultService.findAll({
        hospitalId: query.hospitalId,
        page: {
          page: query.page ? parseInt(query.page, 10) : 1,
          limit: 9,
        },
        procedureType: query.procedure,
        technique: query.technique,
        graftCount: query.graftCount
          ? { gte: parseInt(query.graftCount, 10) }
          : undefined,
        verified:
          query.verified === 'on'
            ? true
            : query.verified === 'off'
              ? false
              : undefined,
        ageRange: query.ageRange,
        orderBy: query.orderBy || 'createdAt',
        orderDirection: query.orderDirection || 'desc',
      });

    const ageRanges = await this.hospitalHairResultService.getAgeRanges();

    const results = latestHairResults.map((result) => {
      return {
        ...result,
        procedure: result.procedureType.toUpperCase(),
      };
    });

    const filters = {
      procedures: Object.entries(HairProcedureType).map(([key, value]) => ({
        label: key,
        value,
        selected: query.procedure === value,
      })),
      techniques: Object.entries(HairTransplantTechnique).map(
        ([key, value]) => ({
          label: key,
          value,
          selected: query.technique === value,
        }),
      ),
      graftCounts: Object.entries({
        '1000+': GraftCountEnum.ONE_PLUS,
        '2000+': GraftCountEnum.TWO_PLUS,
        '3000+': GraftCountEnum.THREE_PLUS,
        '4000+': GraftCountEnum.FOUR_PLUS,
        '5000+': GraftCountEnum.FIVE_PLUS,
      }).map(([key, value]) => ({
        label: key,
        value,
        selected: query.graftCount === value,
      })),
      ageRanges: ageRanges
        .filter((ar) => ar.ageRange !== null)
        .map((ar) => ({
          label: ar.ageRange + ` (${ar.count})`,
          value: ar.ageRange,
          count: ar.count,
          selected: query.ageRange === ar.ageRange,
          sortKey: parseInt(ar.ageRange.split('-')[0], 10),
        }))
        .sort((a, b) => a.sortKey - b.sortKey),
      verified: {
        label: 'Verified only',
        selected: query.verified === 'on',
      },
      hospitalId: query.hospitalId || '',
    };

    return res.render('results', {
      currentPage: 'results',
      results,
      pagination: pagination,
      filters,
      seo: {
        title: 'Hair Transplant Results | Medical Care',
        h1Title: 'Hair Transplant Results',
        keywords:
          'hair transplant results, before after hair transplant, verified hair results, FUE results, DHI results',
        description:
          'Browse verified hair transplant before-and-after cases. Filter by procedure type, technique, graft count, age range, and duration.',
        canonical: this.getCanonicalUrl(query),
        ogType: 'website',
        ogTitle: 'Hair Transplant Results | Medical Care',
        ogDescription:
          'Explore real hair transplant outcomes with filters for technique, graft count, and timeline.',
        ogUrl: '/results',
        twitterTitle: 'Hair Transplant Results | Medical Care',
        twitterDescription:
          'See verified before-and-after hair transplant cases and compare outcomes.',
        ...seo,
      },
    });
  }

  @Get('/results/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const result = await this.hospitalHairResultService.findOne(id);

    const similarResults = await this.hospitalHairResultService.findAll({
      hospitalId: result.hospitalId,
      procedureType: result.procedureType,
      technique: result.technique,
      page: { page: 1, limit: 4 },
      orderBy: 'createdAt',
      orderDirection: 'desc',
    });

    return res.render('result-detail', {
      similarResults: similarResults.data.map((r) => ({
        id: r.id,
        verified: r.verified,
        graftCount: r.graftCount,
        technique: r.technique,
        procedure: r.procedureType.toUpperCase(),
        operationDate: r.operationDate,
        imageUrl: r,
        sortedImages: r.sortedImages,
        previewImageUrl: r.previewImageUrl,
      })),
      currentPage: 'results',
      imagesAsJsArray: result.sortedImages.map((img, i) => ({
        src: img.imageUrl,
        caption: i === 0 ? 'Before — Front View' : `After — Image ${i}`,
      })),
      result: {
        ...result,
        images: result.sortedImages.map((img) => img.imageUrl),
      },
    });
  }

  roundDownToThousand(value: number): number {
    return Math.floor(value / 1000) * 1000;
  }

  getCanonicalUrl(query: HairResultQueryDto): string {
    const baseUrl = process.env.APP_URL || '';
    return `${baseUrl}/results`;
  }
}
