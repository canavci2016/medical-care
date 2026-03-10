import {
  IsOptional,
  IsString,
  IsIn,
  IsNumberString,
  ValidateIf,
  Matches,
} from 'class-validator';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';
import { HairProcedureType } from '../../hospital-hair-result/entities/hospital-hair-result.entity';

export class HairResultQueryDto {
  [key: string]: string | undefined;

  @IsOptional()
  @ValidateIf((o: HairResultQueryDto) => o.procedure !== '')
  @IsIn(Object.values(HairProcedureType))
  procedure?: string;

  @IsOptional()
  @ValidateIf((o: HairResultQueryDto) => o.technique !== '')
  @IsIn(Object.values(HairTransplantTechnique))
  technique?: string;

  @IsOptional()
  @ValidateIf((o: HairResultQueryDto) => o.graftCount !== '')
  @IsNumberString()
  @Matches(/^([0-9]|[1-9][0-9]{1,3}|5000)$/, {
    message: 'graftCount must be a number between 0 and 5000',
  })
  graftCount?: string;

  @IsOptional()
  @IsIn(['on', 'off'])
  verified?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsString()
  ageRange?: string;

  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  orderDirection?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @ValidateIf((o: HairResultQueryDto) => o.duration !== '')
  @IsNumberString()
  duration?: string;
}
