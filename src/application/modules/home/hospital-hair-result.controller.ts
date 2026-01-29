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
import { formatDistanceToNow } from 'date-fns';
import { HospitalService } from '../hospital/hospital.service';
import { HairProcedureType } from '../hospital-hair-result/entities/hospital-hair-result.entity';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';
import { id } from 'date-fns/locale';

@Controller('results')
export class HospitalHairResultController {
  constructor(
    private readonly hospitalHairResultService: HospitalHairResultService,
    private readonly hospitalService: HospitalService,
  ) { }

  @Get()
  async findAll(
    @Res() res: Response,
    @Query()
    query: {
      procedure?: string;
      technique?: string;
      graftCount?: string;
      verified?: string;
      page?: string;
      ageRange?: string;
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
    },
  ) {
    const { data: latestHairResults, pagination } =
      await this.hospitalHairResultService.findAll({
        page: {
          page: query.page ? parseInt(query.page, 10) : 1,
          limit: 10,
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
        orderBy: query.orderBy || 'operationDate',
        orderDirection: query.orderDirection || 'desc',
      });

    const ageRanges = await this.hospitalHairResultService.getAgeRanges();

    const hospitals = await this.hospitalService.findAll({
      id: latestHairResults.map((r) => r.hospitalId),
    });

    const results = latestHairResults.map((result) => {
      return {
        id: result.id,
        hospital: hospitals.find((hos) => hos.id === result.hospitalId),
        verified: result.verified,
        graftCount: result.graftCount,
        technique: result.technique,
        procedure: result.procedureType,
        operationDateRelative: result.operationDate
          ? formatDistanceToNow(new Date(result.operationDate), {
            addSuffix: true,
          })
          : '',
        image: result?.images[0]?.imageUrl || null,
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
    };

    const newPagination = {
      ...pagination,
      query,
      pages: [] as any[],
    };

    newPagination.pages = Array.from({ length: pagination.totalPages }).map(
      (_, i) => ({
        page: (i + 1).toString(),
        url: `?${new URLSearchParams({
          ...query,
          page: (i + 1).toString(),
        })}`,
      }),
    );

    return res.render('application/modules/home/views/results', {
      results,
      pagination: newPagination,
      filters,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.hospitalHairResultService.findOne(id);
  }
}
