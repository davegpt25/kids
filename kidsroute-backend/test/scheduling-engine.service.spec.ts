import { Test } from '@nestjs/testing';
import { SchedulingEngineService } from '../src/schedule/engine/scheduling-engine.service';
import { AcademyService } from '../src/academy/academy.service';

describe('SchedulingEngineService', () => {
  let service: SchedulingEngineService;

  const mockAcademyService = {
    findNearby: jest.fn(),
  };

  beforeEach(async () => {
    mockAcademyService.findNearby.mockReset();
    const module = await Test.createTestingModule({
      providers: [
        SchedulingEngineService,
        { provide: AcademyService, useValue: mockAcademyService },
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
      },
      {
        id: 'a2',
        name: '영어나라',
        subjects: ['영어'],
        timeSlots: [{ dayOfWeek: 'mon', startTime: '18:30', endTime: '20:00' }],
      },
    ]);

    const result = await service.recommend({
      latitude: 37.5172,
      longitude: 127.0473,
      radiusMeters: 1000,
      subjectPriority: ['수학', '영어'],
      dismissalTime: '14:00',
    });

    expect(result.combination).toHaveLength(2);
    expect(result.combination[0].id).toBe('a1');
  });

  it('반경 내 학원이 없으면 빈 조합을 반환한다', async () => {
    mockAcademyService.findNearby.mockResolvedValue([]);

    const result = await service.recommend({
      latitude: 37.5172,
      longitude: 127.0473,
      radiusMeters: 500,
      subjectPriority: ['수학'],
      dismissalTime: '14:00',
    });

    expect(result.combination).toHaveLength(0);
  });
});
