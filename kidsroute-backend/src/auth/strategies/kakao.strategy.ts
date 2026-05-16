import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(config: ConfigService, private authService: AuthService) {
    super({
      clientID: config.get<string>('KAKAO_CLIENT_ID', ''),
      callbackURL: config.get<string>('KAKAO_CALLBACK_URL', ''),
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any) {
    return this.authService.socialLogin({
      email: profile._json?.kakao_account?.email ?? `${profile.id}@kakao.local`,
      name: profile.displayName,
      provider: 'kakao',
      providerId: String(profile.id),
      profileImage: profile._json?.properties?.profile_image ?? null,
    });
  }
}
