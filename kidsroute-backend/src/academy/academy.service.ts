import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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

  async checkConflicts(academyIds: string[]): Promise<{
    hasConflict: boolean;
    conflicts: { dayOfWeek: string; startTime: string; endTime: string; academyIds: string[] }[];
  }> {
    const academies = await this.academyRepo.find({
      where: { id: In(academyIds) },
      relations: ['timeSlots'],
    });

    const conflicts: { dayOfWeek: string; startTime: string; endTime: string; academyIds: string[] }[] = [];

    for (let i = 0; i < academies.length; i++) {
      for (let j = i + 1; j < academies.length; j++) {
        for (const slotA of academies[i].timeSlots) {
          for (const slotB of academies[j].timeSlots) {
            if (slotA.dayOfWeek !== slotB.dayOfWeek) continue;
            const aStart = this.toMinutes(slotA.startTime);
            const aEnd = this.toMinutes(slotA.endTime);
            const bStart = this.toMinutes(slotB.startTime);
            const bEnd = this.toMinutes(slotB.endTime);
            if (aStart < bEnd && aEnd > bStart) {
              conflicts.push({
                dayOfWeek: slotA.dayOfWeek,
                startTime: slotA.startTime,
                endTime: slotA.endTime,
                academyIds: [academies[i].id, academies[j].id],
              });
            }
          }
        }
      }
    }

    return { hasConflict: conflicts.length > 0, conflicts };
  }

  private toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
}
