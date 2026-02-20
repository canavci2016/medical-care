import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class OtherController {
  @Get('about')
  about(@Req() req, @Res() res: Response) {
    return res.render('about', {
      styles: ['about.css'],
      success: req.flash('success'),
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
