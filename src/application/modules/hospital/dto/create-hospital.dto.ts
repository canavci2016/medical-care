/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsInt,
  IsNumber,
  IsArray,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';

export class CreateHospitalDto {
  /* ===============================
     BASIC INFO
  =============================== */

  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  googlePlaceId?: string;

  /* ===============================
     CONTACT
  =============================== */

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  /* ===============================
     INSTAGRAM (SOCIAL PROOF)
  =============================== */

  @IsOptional()
  @IsString()
  instagramHandle?: string;

  @IsOptional()
  @IsUrl()
  instagramUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  instagramFollowers?: number;

  @IsOptional()
  @IsBoolean()
  instagramVerified?: boolean;

  /* ===============================
     MEDICAL / TRUST
  =============================== */

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  reviewCount?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techniques?: HairTransplantTechnique[];
}
