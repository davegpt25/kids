import { IsNumber, IsArray, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchAcademyDto {
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
  radiusMeters: number = 1000;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  subjects: string[] = [];
}
