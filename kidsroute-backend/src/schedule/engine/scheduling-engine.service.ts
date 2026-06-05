import { Injectable } from '@nestjs/common';
import { AcademyService } from '../../academy/academy.service';
import { KakaoDirectionsService } from '../../common/kakao-directions/kakao-directions.service';
import { ConflictChecker } from './conflict-checker';
import { Combinator, AcademyWithSlots } from './combinator';
import { RecommendScheduleDto } from '../dto/recommend-schedule.dto';

export interface JourneyStop {
  type: 'school' | 'academy' | 'home';
  label: string;
  time: string;
  academyId?: string;
}

export interface JourneyConnector {
  walkingMinutes: number;
  drivingMinutes: number | null;
}

export interface Combination {
  rank: number;
  academies: AcademyWithSlots[];
  totalMonthlyFee: number;
  weeklyHours: number;
  journey: { stops: JourneyStop[]; connectors: JourneyConnector[] };
}

export interface RecommendResponse {
  combinations: Combination[];
  totalCount: number;
}

@Injectable()
export class SchedulingEngineService {
  private readonly checker = new ConflictChecker({ walkingBufferMinutes: 10 });
  private readonly combinator = new Combinator(this.checker);

  constructor(
    private readonly academyService: AcademyService,
    private readonly kakaoDirections: KakaoDirectionsService,
  ) {}

  async recommend(dto: RecommendScheduleDto): Promise<RecommendResponse> {
    const academies = await this.academyService.findNearby({
      latitude: dto.latitude,
      longitude: dto.longitude,
      radiusMeters: dto.radiusMeters,
      subjects: dto.subjectPriority,
    });

    const topCombos = this.combinator.buildTopCombinations(
      academies,
      dto.subjectPriority,
      3,
    );

    const combinations: Combination[] = await Promise.all(
      topCombos.map(async (combo, idx) => {
        const totalMonthlyFee = combo.reduce((s, a) => s + (a.monthlyFee ?? 0), 0);
        const weeklyHours = combo.reduce(
          (s, a) =>
            s +
            a.timeSlots.reduce((h, slot) => {
              const [sh, sm] = slot.startTime.split(':').map(Number);
              const [eh, em] = slot.endTime.split(':').map(Number);
              return h + (eh * 60 + em - (sh * 60 + sm)) / 60;
            }, 0),
          0,
        );

        const journey = await this.buildJourney(
          combo,
          dto.dismissalTime,
          dto.latitude,
          dto.longitude,
        );

        return { rank: idx + 1, academies: combo, totalMonthlyFee, weeklyHours, journey };
      }),
    );

    return { combinations, totalCount: academies.length };
  }

  private async buildJourney(
    combo: AcademyWithSlots[],
    dismissalTime: string,
    schoolLat: number,
    schoolLng: number,
  ): Promise<{ stops: JourneyStop[]; connectors: JourneyConnector[] }> {
    const stops: JourneyStop[] = [
      { type: 'school', label: '하교', time: dismissalTime },
      ...combo.map((a) => ({
        type: 'academy' as const,
        label: a.name,
        time: a.timeSlots.map((s) => `${s.startTime}~${s.endTime}`).join(', '),
        academyId: a.id,
      })),
      { type: 'home', label: '귀가', time: '' },
    ];

    const pairs: Array<{ fromLat: number; fromLng: number; toLat: number; toLng: number }> = [];
    if (combo.length > 0) {
      pairs.push({ fromLat: schoolLat, fromLng: schoolLng, toLat: combo[0].latitude, toLng: combo[0].longitude });
    }
    for (let i = 0; i < combo.length - 1; i++) {
      pairs.push({ fromLat: combo[i].latitude, fromLng: combo[i].longitude, toLat: combo[i + 1].latitude, toLng: combo[i + 1].longitude });
    }
    if (combo.length > 0) {
      const last = combo[combo.length - 1];
      pairs.push({ fromLat: last.latitude, fromLng: last.longitude, toLat: schoolLat, toLng: schoolLng });
    }

    const connectors = await Promise.all(
      pairs.map((p) => this.kakaoDirections.getTravelTime(p.fromLat, p.fromLng, p.toLat, p.toLng)),
    );

    return { stops, connectors };
  }
}
