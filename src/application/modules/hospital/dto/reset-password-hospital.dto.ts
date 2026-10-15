import { IsString, MinLength } from 'class-validator';

export class ResetPasswordHospitalDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
