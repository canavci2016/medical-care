import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class OtherController {
  @Get('/contact')
  @Get('/about')
  about(@Req() req, @Res() res: Response) {
    return res.render('about', {
      styles: ['about.css'],
      seo: {
        title: 'About Us | Medical Care',
        keywords:
          'about medical care, hair transplant platform, healthcare marketplace, clinic transparency',
        description:
          'Learn about Medical Care, our mission, and how we help users discover trusted clinics and real treatment outcomes.',
        canonical: '/about',
        ogType: 'website',
        ogTitle: 'About Us | Medical Care',
        ogDescription:
          'Meet the Medical Care platform and our mission to improve patient decision-making.',
        ogUrl: '/about',
        twitterTitle: 'About Us | Medical Care',
        twitterDescription:
          'Learn more about the Medical Care platform and our mission.',
      },
    });
  }

  @Post('contact')
  @Post('about')
  contact(
    @Req() req,
    @Body()
    body: {
      firstName: string;
      lastName: string;
      email?: string;
      subject?: string;
      technique?: string; //interested technique
      message?: string;
    },
    @Res() res: Response,
  ) {
    return {
      success: true,
      message:
        'Your message has been received. We will get back to you shortly.',
    };
  }
}
