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

@Controller()
export class HospitalHairResultController {
  constructor(
    private readonly hospitalHairResultService: HospitalHairResultService,
    private readonly hospitalService: HospitalService,
  ) { }

  @Get('/results')
  async findAll(@Res() res: Response, @Query() query: HairResultQueryDto) {
    return this.renderResults(query, res);
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
    return this.renderResults(query, res);
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

    return this.renderResults(query, res);
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
    return this.renderResults(query, res);
  }

  @Get('/results/:graftCount-grafts')
  async findAllForGrafts(
    @Res() res: Response,
    @Param('graftCount') graftCount: string,
    @Query() query: HairResultQueryDto,
  ) {
    query.graftCount = query.graftCount || graftCount;
    return this.renderResults(query, res);
  }

  async renderResults(query: HairResultQueryDto, @Res() res: Response) {
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
        keywords:
          'hair transplant results, before after hair transplant, verified hair results, FUE results, DHI results',
        description:
          'Browse verified hair transplant before-and-after cases. Filter by procedure type, technique, graft count, age range, and duration.',
        canonical: '/results',
        ogType: 'website',
        ogTitle: 'Hair Transplant Results | Medical Care',
        ogDescription:
          'Explore real hair transplant outcomes with filters for technique, graft count, and timeline.',
        ogUrl: '/results',
        twitterTitle: 'Hair Transplant Results | Medical Care',
        twitterDescription:
          'See verified before-and-after hair transplant cases and compare outcomes.',
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
}
