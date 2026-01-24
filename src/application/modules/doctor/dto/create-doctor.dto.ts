/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsUUID()
  hospitalId?: string;
}
