import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { SchedulingEngineService } from './engine/scheduling-engine.service';
import { RecommendScheduleDto } from './dto/recommend-schedule.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('schedules')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly engineService: SchedulingEngineService,
  ) {}

  @Get('recommend')
  recommend(@Query() dto: RecommendScheduleDto) {
    return this.engineService.recommend(dto);
  }

  @Post()
  save(
    @CurrentUser() user: { id: string },
    @Body() body: { childId: string; academyIds: string[] },
  ) {
    return this.scheduleService.saveSchedule(user.id, body.childId, body.academyIds);
  }

  @Get()
  getAll(@CurrentUser() user: { id: string }) {
    return this.scheduleService.getSchedules(user.id);
  }
}
