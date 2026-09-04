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

@Controller()
export class HospitalController {
  constructor(
    private readonly hospitalService: HospitalService,
    private readonly hospitalHairResultService: HospitalHairResultService,
    private readonly doctorService: DoctorService,
    private readonly countryService: CountryService,
    private readonly cityService: CityService,
  ) { }

  @Get(['/hospitals/api', '/clinics/api'])
  async apiFindPaginated(
    @Res() res: Response,
    @Query() query: HospitalQueryDto,
  ) {
    const [orderCollumn, orderDirection] = query.sorting
      ? query.sorting.split('_')
      : ['rating', 'desc'];

    const response = await this.hospitalService.paginated({
      name: query.name,
      page: {
        limit: query.limit ? parseInt(query.limit, 10) : 12,
        page: query.page ? parseInt(query.page, 10) : 1,
      },
      orderBy: orderCollumn,
      orderDirection: orderDirection as 'asc' | 'desc',
    });

    return res.json(response);
  }

  @Get(['/hospitals/api/:id', '/clinics/api/:id'])
  async apiFindOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const hospital = await this.hospitalService.findOne(id);

    return res.json({ data: hospital });
  }

  @Get(['/hair-transplant/:citySlug/clinics', '/hair-result/:cityId/hospitals'])
  async clinicsOfCity(
    @Res() res: Response,
    @Query() query: HospitalQueryDto,
    @Param('citySlug') citySlug: string,
  ) {
    query.city = citySlug;
    const cityInst = await this.cityService.findOneBy({ slug: citySlug });
    return this.renderResults(res, query, {
      h1Title: `Hair Transplant Clinics in ${cityInst?.name}`,
      title: `Hair Transplant Clinics in ${cityInst?.name}`,
      keywords: `hair transplant clinics in ${cityInst?.name}, best hair clinics in ${cityInst?.name}, clinic ratings, hair restoration hospitals, hospital directory`,
      canonical: `/hair-transplant/${citySlug}/clinics`,
      description: `Browse verified hospitals and clinics for hair transplant procedures in ${cityInst?.name}. Filter by city, rating, and sorting options.`,
      ogTitle: `Hair Transplant Clinics in ${cityInst?.name}`,
      ogDescription: `Discover and compare hair transplant clinics in ${cityInst?.name} by rating and location.`,
      twitterTitle: `Hair Transplant Clinics in ${cityInst?.name}`,
    });
  }

  @Get(['/hospitals', '/clinics'])
  async findAll(@Res() res: Response, @Query() query: HospitalQueryDto) {
    return this.renderResults(res, query);
  }

  async renderResults(
    @Res() res: Response,
    @Query() query: HospitalQueryDto,
    seoProps: Record<string, any> = {},
  ) {
    let cityId: string | undefined = undefined;

    if (query.city) {
      const cityInst = await this.cityService.findOneBy({ slug: query.city });
      cityId = cityInst?.id;
    }

    const [orderCollumn, orderDirection] = query.sorting
      ? query.sorting.split('_')
      : ['rating', 'desc'];

    const { data: hospitals, pagination } =
      await this.hospitalService.paginated({
        name: query.name,
        cityId: cityId,
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
        value: city.slug,
        selected: cityId === city.id,
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
        h1Title: 'Hair Transplant Clinics',
        title: 'Hospitals | Medical Care',
        keywords:
          'hair transplant clinics, best hair clinics, clinic ratings, hair restoration hospitals, hospital directory',
        description:
          'Browse verified hospitals and clinics for hair transplant procedures. Filter by city, rating, and sorting options.',
        canonical: '/hospitals',
        ogType: 'website',
        ogTitle: 'Hospitals | Medical Care',
        ogDescription:
          'Discover and compare hair transplant clinics by rating and location.',
        ogUrl: '/hospitals',
        twitterTitle: 'Hospitals | Medical Care',
        twitterDescription:
          'Compare top hair transplant clinics and clinics in one place.',
        ...seoProps,
      },
    });
  }

  @Get(['/hospitals/:slug', '/clinics/:slug'])
  async findOne(@Param('slug') slug: string, @Res() res: Response) {
    const hospital = await this.hospitalService.findOneBy({ slug });
    if (!hospital) {
      return res.status(404).send('Hospital not found');
    }

    const doctors = await this.doctorService.paginated({
      hospitalId: hospital.id,
      page: 1,
      limit: 5,
    });

    const procedureTypes =
      await this.hospitalHairResultService.getProcedureTypes({
        hospitalId: hospital.id,
      });

    const { data: latestHairResults } =
      await this.hospitalHairResultService.findAll({
        hospitalId: hospital.id,
        page: { limit: 3, page: 1 },
      });

    return res.render('hospital-detail', {
      currentPage: 'hospitals',
      hospital: hospital,
      procedureTypes: procedureTypes,
      doctors: doctors,
      latestHairResults: latestHairResults.map((hr) => ({
        id: hr.id,
        graftCount: hr.graftCount,
        technique: hr.procedureType,
        operationDate: hr.operationDate,
        previewImageUrl: hr.previewImageUrl,
      })),
      totalProcedures: procedureTypes.reduce(
        (total, pt) => total + parseInt(pt.count, 10),
        0,
      ),
    });
  }
}
