import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH, AUTH_SERVICE, UserWithRolesAndVerify } from '@sergo/shared';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let mockClientProxy: ClientProxy;

  const mockClient = {
    send: jest.fn(),
  };

  const mockConfig = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AUTH_SERVICE,
          useValue: mockClient,
        },
        {
          provide: ConfigService,
          useValue: mockConfig,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockClientProxy = module.get<ClientProxy>(AUTH_SERVICE);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should handle auth response and set cookies', async () => {
    const user = {
      id: '123',
      email: 'test@test.com',
      roles: [],
      firstName: 'Test',
      lastName: 'User',
      phone: '+123456789',
      verify: { isEmailVerified: true, isPhoneVerified: true },
    } as UserWithRolesAndVerify;

    const authResponse = {
      access_token: 'access_token',
      refresh_token: 'refresh_token',
      access_expire: new Date().toISOString(),
      refresh_expire: new Date().toISOString(),
      user,
    };

    const mockRes = { cookie: jest.fn() } as unknown as Response;

    // Mock the send() method to return an observable
    jest.spyOn(mockClientProxy, 'send').mockReturnValue(of(authResponse));

    const result = await service.handleAuthResponse(user, mockRes);

    expect(result).toEqual({
      access_token: 'access_token',
      refresh_token: 'refresh_token',
      user,
    });

    // Check if cookies were set
    expect(mockRes.cookie).toHaveBeenCalledWith(
      'Authentication',
      'access_token',
      expect.objectContaining({
        httpOnly: true,
        secure: false, // Assuming you're testing a non-production environment
        expires: new Date(authResponse.access_expire),
      }),
    );

    expect(mockRes.cookie).toHaveBeenCalledWith(
      'Refresh',
      'refresh_token',
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        expires: new Date(authResponse.refresh_expire),
      }),
    );

    // Ensure that lastValueFrom was called
    expect(mockClientProxy.send).toHaveBeenCalledWith(AUTH.LOCAL_LOGIN, {
      ...user,
    });
  });
});
