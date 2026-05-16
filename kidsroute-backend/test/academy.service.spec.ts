import { Test } from '@nestjs/testing';
import { AcademyService } from '../src/academy/academy.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Academy } from '../src/academy/academy.entity';

describe('AcademyService', () => {
  let service: AcademyService;
  const mockRepo = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AcademyService,
        { provide: getRepositoryToken(Academy), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<AcademyService>(AcademyService);
  });

  it('반경 내 학원 목록을 반환한다', async () => {
    const mockAcademies = [
      { id: 'a1', name: '강남수학학원', distance_m: 350 },
      { id: 'a2', name: '영어나라', distance_m: 800 },
    ];
    mockRepo.query.mockResolvedValue(mockAcademies);

    const result = await service.findNearby({
      latitude: 37.5172,
      longitude: 127.0473,
      radiusMeters: 1000,
      subjects: [],
    });

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('강남수학학원');
  });

  it('과목 필터가 적용된다', async () => {
    mockRepo.query.mockResolvedValue([
      { id: 'a1', name: '수학의신', subjects: ['수학'], distance_m: 200 },
    ]);

    const result = await service.findNearby({
      latitude: 37.5172,
      longitude: 127.0473,
      radiusMeters: 1000,
      subjects: ['수학'],
    });

    expect(result).toHaveLength(1);
  });
});
