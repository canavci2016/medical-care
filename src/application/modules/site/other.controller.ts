import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class OtherController {
  @Get('about')
  about(@Req() req, @Res() res: Response) {
    return res.render('about', {
      styles: ['about.css'],
      success: req.flash('success'),
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
  contact(
    @Req() req,
    @Body()
    body: {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    },
    @Res() res: Response,
  ) {
    req.flash('success', 'We have received your message.');

    return res.redirect('/about');
  }
}
