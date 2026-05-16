import { IsNumber, IsArray, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class RecommendScheduleDto {
  @IsNumber()
  @Type(() => Number)
  latitude: number;

  @IsNumber()
  @Type(() => Number)
  longitude: number;

  @IsNumber()
  @Min(500)
  @Max(2000)
  @Type(() => Number)
  radiusMeters: number;

  @IsArray()
  @IsString({ each: true })
  subjectPriority: string[];

  @IsString()
  dismissalTime: string; // e.g., '14:30'
}
