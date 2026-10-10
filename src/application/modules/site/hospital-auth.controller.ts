import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { HospitalService } from '../hospital/hospital.service';
import { LoginHospitalDto } from '../hospital/dto/login-hospital.dto';
import { UpdateHospitalDto } from '../hospital/dto/update-hospital.dto';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';
import { HospitalAuthGuard } from './guards/hospital-auth.guard';

@Controller('hospital')
export class HospitalAuthController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Get('auth/login')
  loginPage(@Res() res: Response) {
    return res.render('hospital-login', {
      layout: false,
    });
  }

  @Post('auth/login')
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
        error: 'Invalid username or password',
      });
    }

    session.hospitalId = hospital.id;

    return res.redirect('/hospital/dashboard');
  }

  @Post('auth/logout')
  logout(@Session() session: Record<string, any>, @Res() res: Response) {
    session.destroy(() => {
      res.redirect('/hospital/auth/login');
    });
  }

  @UseGuards(HospitalAuthGuard)
  @Get('auth/me')
  async me(@Session() session: Record<string, any>) {
    const hospital = await this.hospitalService.findOne(session.hospitalId);
    return hospital;
  }

  @UseGuards(HospitalAuthGuard)
  @Get('dashboard')
  async dashboard(
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const hospital = await this.hospitalService.findOne(session.hospitalId);
    const selectedTechniques = hospital.techniques || [];
    const techniquesOptions = Object.values(HairTransplantTechnique).map(
      (value) => ({
        value,
        selected: selectedTechniques.includes(value),
      }),
    );

    return res.render('hospital-dashboard', {
      hospital,
      techniquesOptions,
      styles: ['create-blog.css'],
      layout: false,
    });
  }

  @UseGuards(HospitalAuthGuard)
  @Put('dashboard')
  async updateOwnHospital(
    @Session() session: Record<string, any>,
    @Body() payload: UpdateHospitalDto,
  ) {
    return this.hospitalService.update(session.hospitalId, payload);
  }

  @UseGuards(HospitalAuthGuard)
  @Post('dashboard/upload-url')
  async getUploadUrl(@Body('contentType') contentType: string) {
    return this.hospitalService.getSignedUrlForImageUpload(contentType);
  }
}

