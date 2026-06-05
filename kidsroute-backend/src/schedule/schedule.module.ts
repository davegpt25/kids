import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedSchedule } from './saved-schedule.entity';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { SchedulingEngineService } from './engine/scheduling-engine.service';
import { AcademyModule } from '../academy/academy.module';
import { KakaoDirectionsModule } from '../common/kakao-directions/kakao-directions.module';

@Module({
  imports: [TypeOrmModule.forFeature([SavedSchedule]), AcademyModule, KakaoDirectionsModule],
  providers: [ScheduleService, SchedulingEngineService],
  controllers: [ScheduleController],
  exports: [ScheduleService],
})
export class ScheduleModule {}
