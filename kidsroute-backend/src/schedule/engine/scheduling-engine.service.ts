import { Injectable } from '@nestjs/common';
import { AcademyService } from '../../academy/academy.service';
import { ConflictChecker } from './conflict-checker';
import { Combinator, AcademyWithSlots } from './combinator';
import { RecommendScheduleDto } from '../dto/recommend-schedule.dto';

@Injectable()
export class SchedulingEngineService {
  private readonly checker = new ConflictChecker({ walkingBufferMinutes: 10 });
  private readonly combinator = new Combinator(this.checker);

  constructor(private readonly academyService: AcademyService) {}

  async recommend(dto: RecommendScheduleDto): Promise<{
    combination: AcademyWithSlots[];
    totalCount: number;
    combinationCount: number;
  }> {
    const academies = await this.academyService.findNearby({
      latitude: dto.latitude,
      longitude: dto.longitude,
      radiusMeters: dto.radiusMeters,
      subjects: dto.subjectPriority,
    });

    const combination = this.combinator.buildCombination(
      academies,
      dto.subjectPriority,
    );

    return {
      combination,
      totalCount: academies.length,
      combinationCount: combination.length,
    };
  }
}
