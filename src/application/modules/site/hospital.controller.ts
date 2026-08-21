import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
} from '@nestjs/common';
import { HospitalService, RatingFilter } from '../hospital/hospital.service';
import type { Response } from 'express';
import { HospitalHairResultService } from '../hospital-hair-result/hospital-hair-result.service';
import { HospitalQueryDto } from './dto/hospital-query.dto';
import { DoctorService } from '../doctor/doctor.service';
import { CountryService } from 'src/application/shared/modules/country/country.service';
import { CityService } from 'src/application/shared/modules/city/city.service';
import { StringHelper } from 'src/application/shared/helpers/String';

@Controller('hospitals')
export class HospitalController {
  constructor(
    private readonly hospitalService: HospitalService,
    private readonly hospitalHairResultService: HospitalHairResultService,
    private readonly doctorService: DoctorService,
    private readonly countryService: CountryService,
    private readonly cityService: CityService,
  ) {}

  @Get('/api')
  async apiFindPaginated(
    @Res() res: Response,
    @Query() query: HospitalQueryDto,
  ) {
    const [orderCollumn, orderDirection] = query.sorting
      ? query.sorting.split('_')
      : ['rating', 'desc'];

    const response = await this.hospitalService.paginated({
      name: query.name,
      cityId: query.cityId,
      rating: query.rating,
      page: {
        limit: query.limit ? parseInt(query.limit, 10) : 12,
        page: query.page ? parseInt(query.page, 10) : 1,
      },
      orderBy: orderCollumn,
      orderDirection: orderDirection as 'asc' | 'desc',
    });

    return res.json(response);
  }

  @Get('/api/:id')
  async apiFindOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const hospital = await this.hospitalService.findOne(id);

    return res.json({ data: hospital });
  }

  @Get()
  async findAll(@Res() res: Response, @Query() query: HospitalQueryDto) {
    const [orderCollumn, orderDirection] = query.sorting
      ? query.sorting.split('_')
      : ['rating', 'desc'];

    const { data: hospitals, pagination } =
      await this.hospitalService.paginated({
        name: query.name,
        cityId: query.city,
        countryId: { eq: query.country },
        rating: query.rating,
        page: {
          limit: query.limit ? parseInt(query.limit, 10) : 12,
          page: query.page ? parseInt(query.page, 10) : 1,
        },
        orderBy: orderCollumn,
        orderDirection: orderDirection as 'asc' | 'desc',
      });

    const cities = await this.cityService.findAll({
      isActive: true,
      take: 500,
    });
    const countries = await this.countryService.findAll({ isActive: true });

    const filters = {
      name: query.name || '',
      cities: cities.map((city) => ({
        label: StringHelper.capitalizeFirstLetter(city.name),
        value: city.id,
        selected: query.city === city.id,
      })),
      countries: countries.map((country) => ({
        label: StringHelper.capitalizeFirstLetter(country.name),
        value: country.id,
        selected: query.country === country.id,
      })),
      stars: Object.entries({
        '5': RatingFilter.FIVE,
        '4+': RatingFilter.FOUR_PLUS,
        '3+': RatingFilter.THREE_PLUS,
        '2+': RatingFilter.TWO_PLUS,
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

    const doctors = await this.doctorService.paginated({
      hospitalId: id,
      page: 1,
      limit: 5,
    });

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
      doctors: doctors,
      latestHairResults: latestHairResults
        .map((hr) => ({
          id: hr.id,
          beforeImage: hr.images[0]?.imageUrl || null,
          afterImage: hr.images[1]?.imageUrl || hr.images[0]?.imageUrl || null,
          graftCount: hr.graftCount,
          technique: hr.procedureType,
          operationDate: hr.operationDate,
        }))
        .filter((hr) => hr.beforeImage && hr.afterImage),
      totalProcedures: procedureTypes.reduce(
        (total, pt) => total + parseInt(pt.count, 10),
        0,
      ),
    });
  }
}
