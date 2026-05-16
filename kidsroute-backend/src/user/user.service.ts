import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

interface SocialProfile {
  email: string;
  name: string;
  provider: 'kakao' | 'google';
  providerId: string;
  profileImage: string | null;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findOrCreate(profile: SocialProfile): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: { provider: profile.provider, providerId: profile.providerId },
    });
    if (existing) return existing;

    return this.userRepo.save({
      email: profile.email,
      name: profile.name,
      provider: profile.provider,
      providerId: profile.providerId,
      profileImage: profile.profileImage ?? undefined,
    });
  }
}
