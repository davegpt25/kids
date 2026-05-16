import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Academy } from './academy.entity';

@Entity('time_slots')
export class TimeSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] })
  dayOfWeek: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @ManyToOne(() => Academy, (academy) => academy.timeSlots, { onDelete: 'CASCADE' })
  academy: Academy;
}
