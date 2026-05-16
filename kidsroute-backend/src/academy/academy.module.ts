import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Academy } from './academy.entity';
import { TimeSlot } from './timeslot.entity';
import { AcademyService } from './academy.service';
import { AcademyController } from './academy.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Academy, TimeSlot])],
  providers: [AcademyService],
  controllers: [AcademyController],
  exports: [TypeOrmModule, AcademyService],
})
export class AcademyModule {}
