import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { APP_RATE_LIMIT_METADATA } from 'src/application/shared/modules/app-rate-limit/app-rate-limit.constants';
import { AppRateLimitGuard } from 'src/application/shared/modules/app-rate-limit/app-rate-limit.guard';
import { AppQueueService } from 'src/application/shared/modules/app-queue/app-queue.service';
import { SupportedEventTypes } from 'src/application/shared/modules/app-queue/supported-event-types.enum';

@Controller()
export class OtherController {
  constructor(private readonly appQueueService: AppQueueService) { }

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

  @UseGuards(AppRateLimitGuard)
  @SetMetadata(APP_RATE_LIMIT_METADATA, {
    keyPrefix: 'contact',
    ttlSeconds: 500, // Set the TTL in seconds, e.g., 60 seconds
    message: 'Too many contact requests. Please try again later.',
    maxAttempts: 5,
  })
  @Post('contact')
  contact(
    @Req() req: Request,
    @Body()
    body: {
      firstName: string;
      lastName: string;
      email?: string;
      subject?: string;
      technique?: string; //interested technique
      message?: string;
    },
  ) {
    return this.enqueueContactSubmission(req, body);
  }

  @Post('about')
  aboutContact(
    @Req() req: Request,
    @Body()
    body: {
      firstName: string;
      lastName: string;
      email?: string;
      subject?: string;
      technique?: string;
      message?: string;
    },
  ) {
    return this.enqueueContactSubmission(req, body);
  }

  private enqueueContactSubmission(
    req: Request,
    body: {
      firstName: string;
      lastName: string;
      email?: string;
      subject?: string;
      technique?: string;
      message?: string;
    },
  ) {
    void this.appQueueService.add(
      SupportedEventTypes.CONTACT_FORM_SUBMISSION,
      {
        ...body,
        ip: req.ip,
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

  @Get('/hair-transplant/:citySlug')
  @Get('/about')
  cityDetail(@Req() req, @Res() res: Response) {
    return res.render('city', {
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
}
