import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedSchedule } from './saved-schedule.entity';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { SchedulingEngineService } from './engine/scheduling-engine.service';
import { AcademyModule } from '../academy/academy.module';

@Module({
  imports: [TypeOrmModule.forFeature([SavedSchedule]), AcademyModule],
  providers: [ScheduleService, SchedulingEngineService],
  controllers: [ScheduleController],
  exports: [ScheduleService],
})
export class ScheduleModule {}
