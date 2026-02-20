import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
} from '@nestjs/common';
import { HospitalService } from '../hospital/hospital.service';
import type { Response } from 'express';
import { HospitalHairResultService } from '../hospital-hair-result/hospital-hair-result.service';
import { buildPagination } from './pagination.util';

@Controller('hospitals')
export class HospitalController {
  constructor(
    private readonly hospitalService: HospitalService,
    private readonly hospitalHairResultService: HospitalHairResultService,
  ) {}

  @Get()
  async findAll(
    @Res() res: Response,
    @Query()
    query: {
      page?: string;
      city?: string;
      rating?: string;
      sorting?: string;
    },
  ) {
    const [orderCollumn, orderDirection] = query.sorting
      ? query.sorting.split('_')
      : ['rating', 'desc'];
    const { data: hospitals, pagination } =
      await this.hospitalService.paginated({
        city: query.city,
        rating: query.rating ? parseInt(query.rating, 10) : undefined,
        page: { limit: 5, page: query.page ? parseInt(query.page, 10) : 1 },
        orderBy: orderCollumn,
        orderDirection: orderDirection as 'asc' | 'desc',
      });

    const newPagination = buildPagination(pagination, query);

    const cities = await this.hospitalService.getCities();

    const filters = {
      cities: cities.map((city) => ({
        label: city.city + ` (${city.count})`,
        value: city.city,
        count: city.count,
        selected: query.city === city.city,
      })),
      stars: Object.entries({
        '5': '5',
        '4+': '4',
        '3+': '3',
        '2+': '2',
      }).map(([key, value]) => ({
        label: key,
        value,
        selected: query.rating === value,
      })),
      sorts: [
        { label: 'Rating (High to Low)', value: 'rating_desc' },
        { label: 'Rating (Low to High)', value: 'rating_asc' },
      ].map((sort) => ({
        ...sort,
        selected: query.sorting === sort.value,
      })),
    };

    return res.render('hospital-list', {
      hospitals,
      pagination: newPagination,
      styles: ['hospital-list.css'],
      filters,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const hospital = await this.hospitalService.findOne(id);
    if (!hospital) {
      return res.status(404).send('Hospital not found');
    }

    const procedureTypes =
      await this.hospitalHairResultService.getProcedureTypes({
        hospitalId: id,
      });

    const { data: latestHairResults } =
      await this.hospitalHairResultService.findAll({
        hospitalId: id,
      });

    return res.render('hospital-detail', {
      hospital: hospital,
      procedureTypes: procedureTypes,
      latestHairResults: latestHairResults
        .map((hr) => ({
          id: hr.id,
          imageUrl: hr.images[0]?.imageUrl || null,
        }))
        .filter((hr) => hr.imageUrl),
      layout: false,
      totalProcedures: procedureTypes.reduce(
        (total, pt) => total + parseInt(pt.count, 10),
        0,
      ),
    });
  }
}
