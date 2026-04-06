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
import { HospitalQueryDto } from './dto/hospital-query.dto';

@Controller('hospitals')
export class HospitalController {
  constructor(
    private readonly hospitalService: HospitalService,
    private readonly hospitalHairResultService: HospitalHairResultService,
  ) { }

  @Get()
  async findAll(@Res() res: Response, @Query() query: HospitalQueryDto) {
    const [orderCollumn, orderDirection] = query.sorting
      ? query.sorting.split('_')
      : ['rating', 'desc'];

    const { data: hospitals, pagination } =
      await this.hospitalService.paginated({
        name: query.name,
        city: query.city,
        rating: query.rating ? parseInt(query.rating, 10) : undefined,
        page: { limit: 12, page: query.page ? parseInt(query.page, 10) : 1 },
        orderBy: orderCollumn,
        orderDirection: orderDirection as 'asc' | 'desc',
      });

    const cities = await this.hospitalService.getCities();

    const filters = {
      name: query.name || '',
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
      currentPage: 'hospitals',
      hospitals,
      pagination,
      filters,
      seo: {
        title: 'Hospitals | Medical Care',
        keywords:
          'hair transplant hospitals, best hair clinics, clinic ratings, hair restoration hospitals, hospital directory',
        description:
          'Browse verified hospitals and clinics for hair transplant procedures. Filter by city, rating, and sorting options.',
        canonical: '/hospitals',
        ogType: 'website',
        ogTitle: 'Hospitals | Medical Care',
        ogDescription:
          'Discover and compare hair transplant hospitals by rating and location.',
        ogUrl: '/hospitals',
        twitterTitle: 'Hospitals | Medical Care',
        twitterDescription:
          'Compare top hair transplant hospitals and clinics in one place.',
      },
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
        page: { limit: 3, page: 1 },
      });

    return res.render('hospital-detail', {
      currentPage: 'hospitals',
      hospital: hospital,
      procedureTypes: procedureTypes,
      latestHairResults: latestHairResults
        .map((hr) => ({
          id: hr.id,
          beforeImage: hr.images[0]?.imageUrl || null,
          afterImage: hr.images[1]?.imageUrl || hr.images[0]?.imageUrl || null,
          graftCount: hr.graftCount,
          technique: hr.procedureType,
          operationDateRelative: hr.operationDateRelative,
        }))
        .filter((hr) => hr.beforeImage && hr.afterImage),
      totalProcedures: procedureTypes.reduce(
        (total, pt) => total + parseInt(pt.count, 10),
        0,
      ),
    });
  }
}
