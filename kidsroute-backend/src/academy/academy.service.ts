import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Academy } from './academy.entity';
import { SearchAcademyDto } from './dto/search-academy.dto';

@Injectable()
export class AcademyService {
  constructor(
    @InjectRepository(Academy)
    private readonly academyRepo: Repository<Academy>,
  ) {}

  async findNearby(dto: SearchAcademyDto) {
    const { latitude, longitude, radiusMeters, subjects } = dto;

    let subjectFilter = '';
    const params: unknown[] = [longitude, latitude, radiusMeters];

    if (subjects && subjects.length > 0) {
      const conditions = subjects.map(
        (_, i) => `$${params.length + i + 1} = ANY(string_to_array(a.subjects, ','))`,
      );
      subjectFilter = `AND (${conditions.join(' OR ')})`;
      params.push(...subjects);
    }

    return this.academyRepo.query(
      `
      SELECT
        a.*,
        ST_Distance(
          ST_MakePoint($1, $2)::geography,
          ST_MakePoint(a.longitude, a.latitude)::geography
        ) AS distance_m,
        COALESCE(
          json_agg(
            json_build_object(
              'id',         ts.id,
              'dayOfWeek',  ts.day_of_week,
              'startTime',  ts.start_time,
              'endTime',    ts.end_time
            )
          ) FILTER (WHERE ts.id IS NOT NULL),
          '[]'::json
        ) AS "timeSlots"
      FROM academies a
      LEFT JOIN time_slots ts ON ts.academy_id = a.id
      WHERE a.latitude IS NOT NULL
        AND a.longitude IS NOT NULL
        AND ST_DWithin(
          ST_MakePoint($1, $2)::geography,
          ST_MakePoint(a.longitude, a.latitude)::geography,
          $3
        )
        ${subjectFilter}
      GROUP BY a.id
      ORDER BY distance_m ASC
      `,
      params,
    );
  }
}
