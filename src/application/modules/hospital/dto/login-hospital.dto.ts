import { IsString, MinLength } from 'class-validator';

export class LoginHospitalDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}
