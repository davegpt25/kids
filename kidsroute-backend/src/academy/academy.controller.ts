import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AcademyService } from './academy.service';
import { SearchAcademyDto } from './dto/search-academy.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('academies')
@UseGuards(JwtAuthGuard)
export class AcademyController {
  constructor(private readonly academyService: AcademyService) {}

  @Get('nearby')
  findNearby(@Query() dto: SearchAcademyDto) {
    return this.academyService.findNearby(dto);
  }

  @Post('check-conflicts')
  checkConflicts(@Body() body: { academyIds: string[] }) {
    return this.academyService.checkConflicts(body.academyIds);
  }
}
