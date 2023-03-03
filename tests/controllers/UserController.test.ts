/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import 'isomorphic-fetch';
import 'jest-extended';
import { configureControllerTest, FastifyInstanceWithController } from '@fastify-decorators/simple-di/testing';
import { UserService } from 'cps-common-models/dist/src/services/UserService.js';
import { User } from 'cps-common-models/dist/src/entities/User.js';
import { UserController } from '../../src/controllers/UserController.js';

describe('test UserController', () => {
  let instance: FastifyInstanceWithController<UserController>;

  const userService = {
    get: jest.fn(),
    getById: jest.fn(),
    init: jest.fn(),
    deleteBy: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  beforeAll(async () => {
    instance = await configureControllerTest({
      controller: UserController,
      mocks: [
        {
          provide: UserService,
          useValue: userService,
        },
      ],
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should properly return an empty User list', async () => {
    expect.hasAssertions();

    const users: User[] = [];
    userService.get.mockResolvedValue(Promise.resolve(users));

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/users',
      method: 'GET',
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify([]));

    jest.resetAllMocks();
  });

  it('should properly return a 404 regarding the request of a User based on its user_id', async () => {
    expect.hasAssertions();

    userService.getById.mockResolvedValue(null);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/users/23',
      method: 'GET',
    });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Entity not found');

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the creation of a User', async () => {
    expect.hasAssertions();

    const user: Partial<User> = {
      userId: 23,
      userName: 'Pedro',
    };
    userService.createOrUpdate.mockResolvedValue(user);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/users',
      method: 'POST',
      payload: {
        userName: 'Pedro',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(user));

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the update of a User', async () => {
    expect.hasAssertions();

    const user: Partial<User> = {
      userId: 23,
      userName: 'Pedro',
    };
    userService.createOrUpdate.mockResolvedValue(user);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/users',
      method: 'PUT',
      payload: {
        userId: 23,
        userName: 'Pedro',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(user));

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the deletion of a User', async () => {
    expect.hasAssertions();

    userService.createOrUpdate.mockResolvedValue(Promise.resolve());

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/users/23',
      method: 'DELETE',
    });

    expect(result.statusCode).toBe(200);

    jest.resetAllMocks();
  });
});
