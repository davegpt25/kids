import { Test } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { UserService } from '../src/user/user.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  const mockUserService = {
    findOrCreate: jest.fn(),
  };
  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  it('소셜 로그인 성공 시 JWT를 반환한다', async () => {
    const mockUser = { id: 'uuid-1', email: 'test@test.com', name: '홍길동' };
    mockUserService.findOrCreate.mockResolvedValue(mockUser);

    const result = await service.socialLogin({
      email: 'test@test.com',
      name: '홍길동',
      provider: 'kakao',
      providerId: 'kakao-123',
      profileImage: null,
    });

    expect(result.accessToken).toBe('mock-jwt-token');
    expect(mockUserService.findOrCreate).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@test.com' }),
    );
  });
});
