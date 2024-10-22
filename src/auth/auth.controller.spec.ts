import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClientProxy } from '@nestjs/microservices';
import {
  AUTH_SERVICE,
  CreateUserDto,
  USERS,
  UserWithRolesAndVerify,
} from '@sergo/shared';
import { Response } from 'express';
import { of } from 'rxjs';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let mockClientProxy: ClientProxy;

  const mockAuthService = {
    handleAuthResponse: jest.fn(),
  };

  const mockClient = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: AUTH_SERVICE,
          useValue: mockClient,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    mockClientProxy = module.get<ClientProxy>(AUTH_SERVICE);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should sign up a new user', async () => {
    const user: CreateUserDto = {
      email: 'test@test.com',
      password: '12345',
      phone: '+972524802045',
      firstName: 'test',
      lastName: 'test',
    };

    // Mock the send method to return an observable
    jest
      .spyOn(mockClientProxy, 'send')
      .mockReturnValue(of({ id: '123', ...user }));

    const result = await controller.signUp(user);
    expect(result).toEqual({ id: '123', ...user });
    expect(mockClientProxy.send).toHaveBeenCalledWith(USERS.CREATE_USER, {
      ...user,
    });
  });

  it('should login a user', async () => {
    const user: UserWithRolesAndVerify = {
      id: '123',
      email: 'test@test.com',
      roles: [],
      firstName: 'John',
      lastName: 'Doe',
      phone: '+123456789',
      verify: { isEmailVerified: true, isPhoneVerified: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockRes = {} as Response;

    // Mock handleAuthResponse to return a resolved promise
    authService.handleAuthResponse = jest.fn().mockResolvedValue({
      access_token: 'access_token',
      refresh_token: 'refresh_token',
      user,
    });

    const result = await controller.login(user, mockRes);
    expect(result).toEqual({
      access_token: 'access_token',
      refresh_token: 'refresh_token',
      user,
    });
    expect(authService.handleAuthResponse).toHaveBeenCalledWith(user, mockRes);
  });

  it('should refresh token', async () => {
    const user: UserWithRolesAndVerify = {
      id: '123',
      email: 'test@test.com',
      roles: [],
      firstName: 'John',
      lastName: 'Doe',
      phone: '+123456789',
      verify: { isEmailVerified: true, isPhoneVerified: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockRes = {} as Response;

    // Mock handleAuthResponse to return a resolved promise
    authService.handleAuthResponse = jest.fn().mockResolvedValue({
      access_token: 'access_token',
      refresh_token: 'refresh_token',
      user,
    });

    const result = await controller.refreshToken(user, mockRes);
    expect(result).toEqual({
      access_token: 'access_token',
      refresh_token: 'refresh_token',
      user,
    });
    expect(authService.handleAuthResponse).toHaveBeenCalledWith(user, mockRes);
  });
});
