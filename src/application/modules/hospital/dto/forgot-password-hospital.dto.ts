import { IsEmail } from 'class-validator';

export class ForgotPasswordHospitalDto {
  @IsEmail()
  email: string;
}
