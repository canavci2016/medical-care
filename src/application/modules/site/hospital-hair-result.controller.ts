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
import { HospitalService } from '../hospital/hospital.service';
import { HairProcedureType } from '../hospital-hair-result/entities/hospital-hair-result.entity';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';
import { HairResultQueryDto } from './dto/hair-result-query.dto';

@Controller('results')
export class HospitalHairResultController {
  constructor(
    private readonly hospitalHairResultService: HospitalHairResultService,
    private readonly hospitalService: HospitalService,
  ) { }

  @Get()
  async findAll(@Res() res: Response, @Query() query: HairResultQueryDto) {
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
        availableMonths: query.duration
          ? parseInt(query.duration, 10)
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
    const availableMonths =
      await this.hospitalHairResultService.getAvailableMonths();

    const hospitals = await this.hospitalService.findAll({
      id: latestHairResults.map((r) => r.hospitalId),
    });

    const results = latestHairResults.map((result) => {
      const sortedImages = result.images.sort((a, b) => a.month - b.month);
      let beforeImageUrl = sortedImages.find(
        (img) => img.isBefore && img.isAfter,
      )?.imageUrl;

      if (!beforeImageUrl) {
        beforeImageUrl = sortedImages.find((img) => img.isBefore)?.imageUrl;
      }

      if (!beforeImageUrl) {
        beforeImageUrl = sortedImages.find((img) => img.month === 0)?.imageUrl;
      }

      if (!beforeImageUrl && sortedImages.length > 0) {
        beforeImageUrl = sortedImages[0].imageUrl;
      }

      return {
        id: result.id,
        hospital: hospitals.find((hos) => hos.id === result.hospitalId),
        verified: result.verified,
        graftCount: result.graftCount,
        technique: result.technique,
        procedure: result.procedureType.toUpperCase(),
        operationDateRelative: result.operationDateRelative,
        imageUrl: beforeImageUrl,
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
        '3000+': '3000',
        '4000+': '4000',
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
      availableMonths: availableMonths.map((month) => ({
        label:
          month.month === 0
            ? 'Before'
            : `${month.month} months after (${month.count})`,
        value: month.month,
        selected: query.duration === month.month.toString(),
      })),
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

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const result = await this.hospitalHairResultService.findOne(id);
    const hospital = await this.hospitalService.findAll({
      id: result.hospitalId,
    });

    const sortedImages = result.images.sort((a, b) => {

      if (a.isBefore && a.isAfter) return -1;
      if (b.isBefore && b.isAfter) return 1;
      if (a.isBefore) return -1;
      return a.month - b.month;
    });

    const newResult = {
      ...result,
      hospital: hospital[0] || null,
      previewImageUrl: sortedImages[0]?.imageUrl || null,
      images: sortedImages.map((img) => img.imageUrl),
    };

    return res.render('result-detail', {
      currentPage: 'results',
      imagesAsJsArray: sortedImages.map((img, i) => ({
        src: img.imageUrl,
        caption: i === 0 ? 'Before — Front View' : `After — Image ${i}`,
      })),
      result: newResult,
    });
  }
}
