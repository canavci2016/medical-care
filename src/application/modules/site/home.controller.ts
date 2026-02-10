import { Controller, Get, Res } from '@nestjs/common';
import { HomeService } from './home.service';
import type { Response } from 'express';
import { formatDistanceToNow } from 'date-fns';

@Controller('/')
export class HomeController {
  constructor(private readonly homeService: HomeService) { }

  @Get()
  async getHomeData(@Res() res: Response) {
    const latestHairResults = await this.homeService.getLatestHairResults();

    const results = latestHairResults.map((result) => ({
      hospital: result.hospital,
      verified: result.verified,
      graftCount: result.graftCount,
      operationDateRelative: result.operationDate
        ? formatDistanceToNow(new Date(result.operationDate), {
          addSuffix: true,
        })
        : '',
      image: result?.images[0]?.imageUrl || null,
    }));

    return res.render('index', {
      results,
      styles: ['home.css'],
    });
  }

  @Get('home2')
  getHomeData2(@Res() res: Response) {
    return res.render('application/modules/home/views/index-full');
  }
}
