/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsInt,
  IsArray,
  IsUUID,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';
import { HairProcedureType } from '../entities/hospital-hair-result.entity';

export class CreateHospitalHairResultDto {
  /* ===============================
     RELATIONS
  =============================== */

  @IsUUID()
  hospitalId: string;

  @IsOptional()
  @IsUUID()
  doctorId?: string;

  /* ===============================
     PROCEDURE INFO
  =============================== */

  @IsEnum(HairProcedureType)
  procedureType: HairProcedureType;

  @IsEnum(HairTransplantTechnique)
  technique: HairTransplantTechnique;

  @IsInt()
  @Min(0)
  graftCount: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  operationDurationMinutes?: number;

  @IsOptional()
  @IsDateString()
  operationDate?: Date;

  /* ===============================
     RESULT TIMELINE
  =============================== */

  @IsInt()
  @Min(0)
  monthsAfter: number;

  @IsArray()
  @IsInt({ each: true })
  availableMonths: number[];

  /* ===============================
     PATIENT DATA (ANONYMIZED)
  =============================== */

  @IsOptional()
  @IsString()
  patientAgeRange?: string;

  @IsOptional()
  @IsString()
  norwoodScale?: string;

  @IsOptional()
  @IsString()
  donorAreaQuality?: string;

  @IsOptional()
  @IsString()
  hairType?: string;

  /* ===============================
     VERIFICATION & TRUST
  =============================== */

  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @IsOptional()
  @IsString()
  verifiedBy?: string;

  @IsOptional()
  @IsDateString()
  verifiedAt?: Date;

  @IsOptional()
  @IsBoolean()
  consentReceived?: boolean;

  /* ===============================
     VISIBILITY & SOCIAL
  =============================== */

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  sharedOnInstagram?: boolean;

  @IsOptional()
  @IsUrl()
  instagramPostUrl?: string;

  /* ===============================
     SEO & ANALYTICS
  =============================== */

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  viewCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  saveCount?: number;

  /* ===============================
     NOTES
  =============================== */

  @IsOptional()
  @IsString()
  doctorNotes?: string;

  @IsOptional()
  @IsString()
  patientStory?: string;

   @IsOptional()
   @IsArray()
   @IsUrl({}, { each: true })
   imageUrls?: string[];
}
