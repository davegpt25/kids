import { Test } from '@nestjs/testing';
import { SchedulingEngineService } from '../src/schedule/engine/scheduling-engine.service';
import { AcademyService } from '../src/academy/academy.service';
import { KakaoDirectionsService } from '../src/common/kakao-directions/kakao-directions.service';

describe('SchedulingEngineService', () => {
  let service: SchedulingEngineService;

  const mockAcademyService = {
    findNearby: jest.fn(),
  };

  const mockKakaoDirections = {
    getTravelTime: jest.fn().mockResolvedValue({ walkingMinutes: 10, drivingMinutes: 5 }),
  };

  beforeEach(async () => {
    mockAcademyService.findNearby.mockReset();
    mockKakaoDirections.getTravelTime.mockReset();
    mockKakaoDirections.getTravelTime.mockResolvedValue({ walkingMinutes: 10, drivingMinutes: 5 });
    const module = await Test.createTestingModule({
      providers: [
        SchedulingEngineService,
        { provide: AcademyService, useValue: mockAcademyService },
        { provide: KakaoDirectionsService, useValue: mockKakaoDirections },
      ],
    }).compile();
    service = module.get<SchedulingEngineService>(SchedulingEngineService);
  });

  it('반경 내 학원을 조회해 충돌 없는 조합을 반환한다', async () => {
    mockAcademyService.findNearby.mockResolvedValue([
      {
        id: 'a1',
        name: '강남수학',
        subjects: ['수학'],
        timeSlots: [{ dayOfWeek: 'mon', startTime: '16:00', endTime: '18:00' }],
        latitude: 37.5172,
        longitude: 127.0473,
        address: '',
        monthlyFee: 0,
        phone: '',
        hasTimetable: false,
        distance_m: 100,
      },
      {
        id: 'a2',
        name: '영어나라',
        subjects: ['영어'],
        timeSlots: [{ dayOfWeek: 'mon', startTime: '18:30', endTime: '20:00' }],
        latitude: 37.5175,
        longitude: 127.0480,
        address: '',
        monthlyFee: 0,
        phone: '',
        hasTimetable: false,
        distance_m: 200,
      },
    ]);

    const result = await service.recommend({
      latitude: 37.5172,
      longitude: 127.0473,
      radiusMeters: 1000,
      subjectPriority: ['수학', '영어'],
      dismissalTime: '14:00',
    });

    expect(result.combinations.length).toBeGreaterThanOrEqual(1);
    expect(result.combinations[0].academies[0].id).toBe('a1');
  });

  it('반경 내 학원이 없으면 빈 조합 배열을 반환한다', async () => {
    mockAcademyService.findNearby.mockResolvedValue([]);

    const result = await service.recommend({
      latitude: 37.5172,
      longitude: 127.0473,
      radiusMeters: 500,
      subjectPriority: ['수학'],
      dismissalTime: '14:00',
    });

    expect(result.combinations).toHaveLength(0);
  });
});
