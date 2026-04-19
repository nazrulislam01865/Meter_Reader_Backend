import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateManualReadingDto {
  @IsString()
  @MaxLength(40)
  meterNumber!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  currentReading!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  previousReading!: number;

  @IsDateString()
  readingDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}