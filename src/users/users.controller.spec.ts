import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE, UserWithRolesAndVerify } from '@sergo/shared';

describe('UsersController', () => {
  let controller: UsersController;
  let mockClientProxy: ClientProxy;

  const mockClient = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: AUTH_SERVICE,
          useValue: mockClient,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    mockClientProxy = module.get<ClientProxy>(AUTH_SERVICE);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the current user on getMe', async () => {
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

    const result = await controller.getMe(user);
    expect(result).toEqual(user);
  });
});
