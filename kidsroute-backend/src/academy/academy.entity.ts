import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TimeSlot } from './timeslot.entity';

@Entity('academies')
export class Academy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'simple-array', nullable: true })
  subjects: string[];

  @Column({ nullable: true })
  monthlyFee: number;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: false })
  isOwnerVerified: boolean;

  @Column({ default: 'auto' })
  dataSource: string;

  @Column({ default: false })
  hasTimetable: boolean;

  @OneToMany(() => TimeSlot, (slot) => slot.academy, { cascade: true })
  timeSlots: TimeSlot[];
}
