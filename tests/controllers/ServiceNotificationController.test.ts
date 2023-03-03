/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import 'isomorphic-fetch';
import 'jest-extended';
import { configureControllerTest, FastifyInstanceWithController } from '@fastify-decorators/simple-di/testing';
import { ServiceNotificationService } from 'cps-common-models/dist/src/services/ServiceNotificationService.js';
import { ServiceNotification } from 'cps-common-models/dist/src/entities/ServiceNotification.js';
import { ServiceNotificationController } from '../../src/controllers/ServiceNotificationController.js';

describe('test ServiceNotificationController', () => {
  let instance: FastifyInstanceWithController<ServiceNotificationController>;

  const serviceNotificationService = {
    get: jest.fn(),
    getById: jest.fn(),
    init: jest.fn(),
    deleteBy: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  beforeAll(async () => {
    instance = await configureControllerTest({
      controller: ServiceNotificationController,
      mocks: [
        {
          provide: ServiceNotificationService,
          useValue: serviceNotificationService,
        },
      ],
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should properly return an empty ServiceNotification list', async () => {
    expect.hasAssertions();

    const serviceNotifications: ServiceNotification[] = [];
    serviceNotificationService.get.mockResolvedValue(Promise.resolve(serviceNotifications));

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/serviceNotifications',
      method: 'GET',
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify([]));

    jest.resetAllMocks();
  });

  it('should properly return a 404 regarding the request of a ServiceNotification based on its servicenotification_id', async () => {
    expect.hasAssertions();

    serviceNotificationService.getById.mockResolvedValue(null);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/serviceNotifications/23',
      method: 'GET',
    });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Entity not found');

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the creation of a ServiceNotification', async () => {
    expect.hasAssertions();

    const serviceNotification: Partial<ServiceNotification> = {
      notificationId: 23,
      notificationType: 'type',
      notificationNumber: 'number',
    };
    serviceNotificationService.createOrUpdate.mockResolvedValue(serviceNotification);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/serviceNotifications',
      method: 'POST',
      payload: {
        notificationType: 'type',
        notificationNumber: 'number',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(serviceNotification));

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the update of a ServiceNotification', async () => {
    expect.hasAssertions();

    const serviceNotification: Partial<ServiceNotification> = {
      notificationId: 23,
      notificationType: 'type',
      notificationNumber: 'number',
    };
    serviceNotificationService.createOrUpdate.mockResolvedValue(serviceNotification);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/serviceNotifications',
      method: 'PUT',
      payload: {
        notificationId: 23,
        notificationType: 'type',
        notificationNumber: 'number',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(serviceNotification));

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the deletion of a ServiceNotification', async () => {
    expect.hasAssertions();

    serviceNotificationService.createOrUpdate.mockResolvedValue(Promise.resolve());

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/serviceNotifications/23',
      method: 'DELETE',
    });

    expect(result.statusCode).toBe(200);

    jest.resetAllMocks();
  });
});
