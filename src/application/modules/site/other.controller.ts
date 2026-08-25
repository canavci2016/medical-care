import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AppQueueService } from 'src/application/shared/modules/app-queue/app-queue.service';
import { SupportedEventTypes } from 'src/application/shared/modules/app-queue/supported-event-types.enum';

@Controller()
export class OtherController {
  constructor(private readonly appQueueService: AppQueueService) {}

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
  async contact(
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
    //TODO: Prevent spam by adding a captcha or rate limiting as well as jobid to prevent duplicate submissions. Also, consider adding a queue for sending emails to avoid blocking the request.
    await this.appQueueService.add(
      SupportedEventTypes.CONTACT_FORM_SUBMISSION,
      {
        ...body,
        ip: req?.ip,
        createdAt: new Date().toISOString(),
      },
      {
        removeOnFail: true,
      },
    );

    return {
      success: true,
      message:
        'Your message has been received. We will get back to you shortly.',
    };
  }
}
