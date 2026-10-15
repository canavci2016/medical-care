import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Res,
  SetMetadata,
  Session,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { HospitalService } from '../hospital/hospital.service';
import { LoginHospitalDto } from '../hospital/dto/login-hospital.dto';
import { UpdateHospitalDto } from '../hospital/dto/update-hospital.dto';
import { ChangePasswordHospitalDto } from '../hospital/dto/change-password-hospital.dto';
import { ForgotPasswordHospitalDto } from '../hospital/dto/forgot-password-hospital.dto';
import { ResetPasswordHospitalDto } from '../hospital/dto/reset-password-hospital.dto';
import { HospitalPasswordResetService } from '../hospital/hospital-password-reset.service';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';
import { HospitalAuthGuard } from './guards/hospital-auth.guard';
import { APP_RATE_LIMIT_METADATA } from 'src/application/shared/modules/app-rate-limit/app-rate-limit.constants';
import { AppRateLimitGuard } from 'src/application/shared/modules/app-rate-limit/app-rate-limit.guard';

@Controller('hospital')
export class HospitalAuthController {
  constructor(
    private readonly hospitalService: HospitalService,
    private readonly hospitalPasswordResetService: HospitalPasswordResetService,
  ) {}

  @Get('auth/login')
  loginPage(@Res() res: Response) {
    return res.render('hospital-login', {
      layout: false,
    });
  }

  @Get('auth/forgot-password')
  forgotPasswordPage(@Res() res: Response) {
    return res.render('hospital-forgot-password', {
      layout: false,
    });
  }

  @UseGuards(AppRateLimitGuard)
  @SetMetadata(APP_RATE_LIMIT_METADATA, {
    keyPrefix: 'hospital-password-reset',
    ttlSeconds: 600,
    message: 'Too many password reset requests. Please try again later.',
    maxAttempts: 5,
  })
  @Post('auth/forgot-password')
  async forgotPassword(
    @Body() payload: ForgotPasswordHospitalDto,
    @Res() res: Response,
  ) {
    try {
      await this.hospitalPasswordResetService.requestPasswordReset(
        payload.email,
      );
    } catch {
      return res.render('hospital-forgot-password', {
        layout: false,
        success:
          'If an account exists for that email, a password reset link will be sent shortly.',
      });
    }

    return res.render('hospital-forgot-password', {
      layout: false,
      success:
        'If an account exists for that email, a password reset link will be sent shortly.',
    });
  }

  @Get('auth/reset-password')
  resetPasswordPage(@Query('token') token: string, @Res() res: Response) {
    return res.render('hospital-reset-password', {
      layout: false,
      token,
    });
  }

  @Post('auth/reset-password')
  async resetPassword(
    @Body() payload: ResetPasswordHospitalDto,
    @Res() res: Response,
  ) {
    try {
      const reset = await this.hospitalPasswordResetService.resetPassword(
        payload.token,
        payload.newPassword,
      );

      return res.render('hospital-reset-password', {
        layout: false,
        token: reset ? undefined : payload.token,
        success: reset ? 'Your password has been reset.' : undefined,
        error: reset
          ? undefined
          : 'This password reset link is invalid or has expired.',
      });
    } catch {
      return res.render('hospital-reset-password', {
        layout: false,
        token: payload.token,
        error: 'Your password could not be reset. Please request a new link.',
      });
    }
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
    session.hospitalAuthVersion = hospital.authVersion;

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
    // Password changes go through the dedicated change-password flow.
    delete payload.password;

    return this.hospitalService.update(session.hospitalId, payload);
  }

  @UseGuards(HospitalAuthGuard)
  @Get('dashboard/password')
  changePasswordPage(@Res() res: Response) {
    return res.render('hospital-change-password', {
      layout: false,
    });
  }

  @UseGuards(HospitalAuthGuard)
  @Post('dashboard/password')
  async changePassword(
    @Session() session: Record<string, any>,
    @Body() payload: ChangePasswordHospitalDto,
    @Res() res: Response,
  ) {
    try {
      await this.hospitalService.changePassword(
        session.hospitalId,
        payload.currentPassword,
        payload.newPassword,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Password could not be changed.';
      return res.render('hospital-change-password', {
        layout: false,
        error: message,
      });
    }

    return res.render('hospital-change-password', {
      layout: false,
      success: 'Password updated successfully.',
    });
  }

  @UseGuards(HospitalAuthGuard)
  @Post('dashboard/upload-url')
  async getUploadUrl(@Body('contentType') contentType: string) {
    return this.hospitalService.getSignedUrlForImageUpload(contentType);
  }
}
