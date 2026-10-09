import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../../user/user.service';

describe('JwtStrategy', () => {
  it('uses the persisted account role instead of the token role', async () => {
    const userService = {
      findUserById: jest.fn().mockResolvedValue({
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        email: 'recruiter@example.com',
        role: 'recruiter',
      }),
    };
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    };
    const strategy = new JwtStrategy(
      configService as ConfigService,
      userService as unknown as UserService,
    );

    await expect(
      strategy.validate({
        sub: '507f1f77bcf86cd799439011',
        role: 'job_seeker',
      }),
    ).resolves.toEqual({
      userId: '507f1f77bcf86cd799439011',
      email: 'recruiter@example.com',
      role: 'recruiter',
    });
  });
});
