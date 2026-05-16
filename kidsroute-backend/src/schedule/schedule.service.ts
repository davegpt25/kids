import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedSchedule } from './saved-schedule.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(SavedSchedule)
    private readonly scheduleRepo: Repository<SavedSchedule>,
  ) {}

  async saveSchedule(
    userId: string,
    childId: string,
    academyIds: string[],
  ): Promise<SavedSchedule> {
    return this.scheduleRepo.save({
      user: { id: userId },
      child: { id: childId },
      academyIds,
    });
  }

  async getSchedules(userId: string): Promise<SavedSchedule[]> {
    return this.scheduleRepo.find({
      where: { user: { id: userId } },
      relations: ['child'],
      order: { createdAt: 'DESC' },
    });
  }
}
