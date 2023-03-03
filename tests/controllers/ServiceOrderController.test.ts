/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import 'isomorphic-fetch';
import 'jest-extended';
import { configureControllerTest, FastifyInstanceWithController } from '@fastify-decorators/simple-di/testing';
import { ServiceOrderService } from 'cps-common-models/dist/src/services/ServiceOrderService.js';
import { ServiceOrder } from 'cps-common-models/dist/src/entities/ServiceOrder.js';
import { ServiceOrderController } from '../../src/controllers/ServiceOrderController.js';

describe('test ServiceOrderController', () => {
  let instance: FastifyInstanceWithController<ServiceOrderController>;

  const serviceOrderService = {
    get: jest.fn(),
    getById: jest.fn(),
    init: jest.fn(),
    deleteBy: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  beforeAll(async () => {
    instance = await configureControllerTest({
      controller: ServiceOrderController,
      mocks: [
        {
          provide: ServiceOrderService,
          useValue: serviceOrderService,
        },
      ],
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should properly return an empty ServiceOrder list', async () => {
    expect.hasAssertions();

    const serviceOrders: ServiceOrder[] = [];
    serviceOrderService.get.mockResolvedValue(Promise.resolve(serviceOrders));

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/serviceOrders',
      method: 'GET',
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify([]));

    jest.resetAllMocks();
  });

  it('should properly return a 404 regarding the request of a ServiceOrder based on its serviceorder_id', async () => {
    expect.hasAssertions();

    serviceOrderService.getById.mockResolvedValue(null);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/serviceOrders/23',
      method: 'GET',
    });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Entity not found');

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the creation of a ServiceOrder', async () => {
    expect.hasAssertions();

    const serviceOrder: Partial<ServiceOrder> = {
      serviceOrderId: 23,
      description: 'description',
    };
    serviceOrderService.createOrUpdate.mockResolvedValue(serviceOrder);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/serviceOrders',
      method: 'POST',
      payload: {
        description: 'description',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(serviceOrder));

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the update of a ServiceOrder', async () => {
    expect.hasAssertions();

    const serviceOrder: Partial<ServiceOrder> = {
      serviceOrderId: 23,
      description: 'description',
    };
    serviceOrderService.createOrUpdate.mockResolvedValue(serviceOrder);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/serviceOrders',
      method: 'PUT',
      payload: {
        serviceOrderId: 23,
        description: 'description',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(serviceOrder));

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the deletion of a ServiceOrder', async () => {
    expect.hasAssertions();

    serviceOrderService.createOrUpdate.mockResolvedValue(Promise.resolve());

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/serviceOrders/23',
      method: 'DELETE',
    });

    expect(result.statusCode).toBe(200);

    jest.resetAllMocks();
  });
});
