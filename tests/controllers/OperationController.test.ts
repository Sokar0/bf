/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import 'isomorphic-fetch';
import 'jest-extended';
import { configureControllerTest, FastifyInstanceWithController } from '@fastify-decorators/simple-di/testing';
import { OperationService } from 'cps-common-models/dist/src/services/OperationService.js';
import { Operation } from 'cps-common-models/dist/src/entities/Operation.js';
import { OperationController } from '../../src/controllers/OperationController.js';

describe('test OperationController', () => {
  let instance: FastifyInstanceWithController<OperationController>;

  const operationService = {
    get: jest.fn(),
    getById: jest.fn(),
    init: jest.fn(),
    deleteBy: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  beforeAll(async () => {
    instance = await configureControllerTest({
      controller: OperationController,
      mocks: [
        {
          provide: OperationService,
          useValue: operationService,
        },
      ],
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should properly return an empty Operation list', async () => {
    expect.hasAssertions();

    const operations: Operation[] = [];
    operationService.get.mockResolvedValue(Promise.resolve(operations));

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/operations',
      method: 'GET',
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify([]));

    jest.resetAllMocks();
  });

  it('should properly return a 404 regarding the request of a Operation based on its operation_id', async () => {
    expect.hasAssertions();

    operationService.getById.mockResolvedValue(null);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/operations/23',
      method: 'GET',
    });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Entity not found');

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the creation of a Operation', async () => {
    expect.hasAssertions();

    const operation: Partial<Operation> = {
      operationId: 23,
      operationNumber: '456789',
      description: 'description',
    };
    operationService.createOrUpdate.mockResolvedValue(operation);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/operations',
      method: 'POST',
      payload: {
        operationNumber: '456789',
        description: 'description',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(operation));

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the update of a Operation', async () => {
    expect.hasAssertions();

    const operation: Partial<Operation> = {
      operationId: 23,
      operationNumber: '456789',
      description: 'description',
    };
    operationService.createOrUpdate.mockResolvedValue(operation);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/operations',
      method: 'PUT',
      payload: {
        operationId: 23,
        operationNumber: '456789',
        description: 'description',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(operation));

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the deletion of a Operation', async () => {
    expect.hasAssertions();

    operationService.createOrUpdate.mockResolvedValue(Promise.resolve());

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/operations/23',
      method: 'DELETE',
    });

    expect(result.statusCode).toBe(200);

    jest.resetAllMocks();
  });
});
