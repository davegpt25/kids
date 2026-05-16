import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Child } from '../user/child.entity';

@Entity('saved_schedules')
export class SavedSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Child)
  child: Child;

  @Column({ type: 'simple-json' })
  academyIds: string[];

  @CreateDateColumn()
  createdAt: Date;
}
