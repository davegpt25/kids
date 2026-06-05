import { Injectable, NotFoundException } from '@nestjs/common';
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

  async savePushSettings(
    userId: string,
    scheduleId: string,
    notifications: { academyId: string; enabled: boolean; minutesBefore?: number }[],
  ): Promise<void> {
    const schedule = await this.scheduleRepo.findOne({
      where: { id: scheduleId, user: { id: userId } },
    });
    if (!schedule) throw new NotFoundException('스케줄을 찾을 수 없습니다.');
    schedule.pushSettings = notifications;
    await this.scheduleRepo.save(schedule);
  }

  async getSchedules(userId: string): Promise<SavedSchedule[]> {
    return this.scheduleRepo.find({
      where: { user: { id: userId } },
      relations: ['child'],
      order: { createdAt: 'DESC' },
    });
  }
}
