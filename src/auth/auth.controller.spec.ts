import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from '../_cores/guards/auth.guard';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    verifyAccount: jest.fn(),
    verified: jest.fn(),
    sendForgetPasswordMail: jest.fn(),
    newPassword: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      // 🔥 أهم سطر
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should call register', async () => {
    mockAuthService.register.mockResolvedValue({});

    await controller.create({
      name: 'Mahmoud',
      email: 'test@test.com',
      password: '123',
    } as any);

    expect(mockAuthService.register).toHaveBeenCalled();
  });

  it('should call login', async () => {
    mockAuthService.login.mockResolvedValue({});

    await controller.login({
      email: 'test@test.com',
      password: '123',
    } as any);

    expect(mockAuthService.login).toHaveBeenCalled();
  });
});
