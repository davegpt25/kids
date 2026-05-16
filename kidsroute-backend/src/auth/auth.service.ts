import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

interface SocialProfile {
  email: string;
  name: string;
  provider: 'kakao' | 'google';
  providerId: string;
  profileImage: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async socialLogin(profile: SocialProfile) {
    const user = await this.userService.findOrCreate(profile);
    const payload = { sub: user.id, email: user.email };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
