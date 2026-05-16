import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('children')
export class Child {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  grade: string;

  @Column({ type: 'time' })
  dismissalTime: string;

  @ManyToOne(() => User, (user) => user.children)
  user: User;
}
