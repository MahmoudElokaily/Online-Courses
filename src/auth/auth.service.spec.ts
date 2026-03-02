import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserVerificationsEntity } from './entities/user-verifications.entity';
import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

// 🔥 mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService (Unit)', () => {
  let service: AuthService;
  let userService: any;
  let jwtService: any;
  let verificationRepo: any;
  let mailerService: any;

  const mockUserService = {
    findOneByEmail: jest.fn(),
    create: jest.fn(),
    verifyEmail: jest.fn(),
    changePassword: jest.fn(),
    findOneByUuid: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockVerificationRepo = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        {
          provide: getRepositoryToken(UserVerificationsEntity),
          useValue: mockVerificationRepo,
        },
        { provide: MailerService, useValue: mockMailerService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    verificationRepo = module.get(getRepositoryToken(UserVerificationsEntity));
    mailerService = module.get(MailerService);

    jest.clearAllMocks();
  });

  // ========================
  // REGISTER
  // ========================

  it('should register successfully', async () => {
    mockUserService.findOneByEmail.mockResolvedValue(null);

    mockUserService.create.mockResolvedValue({
      uuid: 'u1',
      name: 'Mahmoud',
      email: 'test@test.com',
      role: 'USER',
    });

    mockJwtService.sign.mockReturnValue('fake_token');

    const result = await service.register({
      name: 'Mahmoud',
      email: 'test@test.com',
      password: '123456',
    } as any);

    expect(mockUserService.create).toHaveBeenCalled();
    expect(result.accessToken).toBe('fake_token');
  });

  it('should throw if email already exists', async () => {
    mockUserService.findOneByEmail.mockResolvedValue({});

    await expect(
      service.register({
        name: 'Mahmoud',
        email: 'test@test.com',
        password: '123',
      } as any),
    ).rejects.toThrow(ConflictException);
  });

  // ========================
  // LOGIN
  // ========================

  it('should login successfully', async () => {
    mockUserService.findOneByEmail.mockResolvedValue({
      uuid: 'u1',
      name: 'Mahmoud',
      email: 'test@test.com',
      password: 'hashed_password',
      role: 'USER',
    });

    mockJwtService.sign.mockReturnValue('token');

    const result = await service.login({
      email: 'test@test.com',
      password: '123456',
    });

    expect(result.accessToken).toBe('token');
  });

  it('should throw if user not found', async () => {
    mockUserService.findOneByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'wrong@test.com',
        password: '123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  // ========================
  // VERIFY ACCOUNT
  // ========================

  it('should verify account successfully', async () => {
    mockVerificationRepo.findOneBy.mockResolvedValue({
      token: 't1',
      uuid: 'u1',
      expires_at: new Date(Date.now() + 10000),
    });

    await service.verified('t1');

    expect(mockVerificationRepo.delete).toHaveBeenCalled();
  });

  it('should throw if token not found', async () => {
    mockVerificationRepo.findOneBy.mockResolvedValue(null);

    await expect(service.verified('bad')).rejects.toThrow(NotFoundException);
  });

  // ========================
  // CHANGE PASSWORD
  // ========================

  it('should change password successfully', async () => {
    mockUserService.findOneByUuid.mockResolvedValue({
      uuid: 'u1',
      password: 'hashed_password',
    });

    await service.changePassword(
      {
        oldPassword: '123',
        newPassword: '456',
        confirmPassword: '456',
      },
      { uuid: 'u1' } as any,
    );

    expect(mockUserService.changePassword).toHaveBeenCalled();
  });

  it('should throw if old password incorrect', async () => {
    const bcrypt = require('bcrypt');
    bcrypt.compare.mockResolvedValue(false);

    mockUserService.findOneByUuid.mockResolvedValue({
      uuid: 'u1',
      password: 'hashed_password',
    });

    await expect(
      service.changePassword(
        {
          oldPassword: 'wrong',
          newPassword: '456',
          confirmPassword: '456',
        },
        { uuid: 'u1' } as any,
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
