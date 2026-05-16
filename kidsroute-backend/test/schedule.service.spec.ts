import { Test } from '@nestjs/testing';
import { ScheduleService } from '../src/schedule/schedule.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SavedSchedule } from '../src/schedule/saved-schedule.entity';

describe('ScheduleService', () => {
  let service: ScheduleService;
  const mockRepo = {
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ScheduleService,
        { provide: getRepositoryToken(SavedSchedule), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<ScheduleService>(ScheduleService);
  });

  it('스케줄을 저장하고 반환한다', async () => {
    const saved = { id: 'sched-1', academyIds: ['a1', 'a2'] };
    mockRepo.save.mockResolvedValue(saved);

    const result = await service.saveSchedule('user-1', 'child-1', ['a1', 'a2']);

    expect(result.academyIds).toEqual(['a1', 'a2']);
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ academyIds: ['a1', 'a2'] }),
    );
  });

  it('사용자의 저장된 스케줄 목록을 반환한다', async () => {
    const schedules = [{ id: 'sched-1' }, { id: 'sched-2' }];
    mockRepo.find.mockResolvedValue(schedules);

    const result = await service.getSchedules('user-1');

    expect(result).toHaveLength(2);
  });
});
