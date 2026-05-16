import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Child } from './child.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ type: 'enum', enum: ['kakao', 'google'] })
  provider: 'kakao' | 'google';

  @Column()
  providerId: string;

  @Column({ type: 'enum', enum: ['free', 'premium'], default: 'free' })
  plan: 'free' | 'premium';

  @OneToMany(() => Child, (child) => child.user, { cascade: true })
  children: Child[];

  @CreateDateColumn()
  createdAt: Date;
}
