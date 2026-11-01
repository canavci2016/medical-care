import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

const isDefined = (_: object, value: unknown) => value !== undefined;

export class CreateTaskDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ValidateIf(isDefined)
  @IsString()
  @MaxLength(500)
  description?: string;

  @ValidateIf(isDefined)
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
