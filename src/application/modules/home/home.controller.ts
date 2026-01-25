import { Controller, Get, Res } from '@nestjs/common';
import { HomeService } from './home.service';
import type { Response } from 'express';

@Controller('/')
export class HomeController {
  constructor(private readonly homeService: HomeService) { }

  @Get()
  async getHomeData(@Res() res: Response) {
    const latestHairResults = await this.homeService.getLatestHairResults();

    return res.render('application/modules/home/views/index', {
      latestHairResults,
    });
  }

  @Get('home2')
  getHomeData2(@Res() res: Response) {
    return res.render('application/modules/home/views/index-full');
  }
}
