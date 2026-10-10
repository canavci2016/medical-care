import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { HospitalService } from '../hospital/hospital.service';
import { LoginHospitalDto } from '../hospital/dto/login-hospital.dto';
import { HospitalAuthGuard } from './guards/hospital-auth.guard';

@Controller('hospital/auth')
export class HospitalAuthController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Get('login')
  loginPage(@Res() res: Response) {
    return res.render('hospital-login', {
      layout: false,
    });
  }

  @Post('login')
  async login(
    @Body() payload: LoginHospitalDto,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const hospital = await this.hospitalService.validateCredentials(
      payload.username,
      payload.password,
    );

    if (!hospital) {
      return res.render('hospital-login', {
        layout: false,
        error: 'Invalid email or password',
      });
    }

    session.hospitalId = hospital.id;

    return res.redirect('/hospital/dashboard');
  }

  @Post('logout')
  logout(@Session() session: Record<string, any>, @Res() res: Response) {
    session.destroy(() => {
      res.redirect('/hospital/auth/login');
    });
  }

  @UseGuards(HospitalAuthGuard)
  @Get('me')
  async me(@Session() session: Record<string, any>) {
    const hospital = await this.hospitalService.findOne(session.hospitalId);
    return hospital;
  }
}
