/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import 'isomorphic-fetch';
import 'jest-extended';
import { configureControllerTest, FastifyInstanceWithController } from '@fastify-decorators/simple-di/testing';
import { AssignedComponentService } from 'cps-common-models/dist/src/services/AssignedComponentService.js';
import { AssignedComponent } from 'cps-common-models/dist/src/entities/AssignedComponent.js';
import { AssignedComponentController } from '../../src/controllers/AssignedComponentController.js';

describe('test AssignedComponentController', () => {
  let instance: FastifyInstanceWithController<AssignedComponentController>;

  const service = {
    get: jest.fn(),
    getById: jest.fn(),
    init: jest.fn(),
    deleteBy: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  beforeAll(async () => {
    instance = await configureControllerTest({
      controller: AssignedComponentController,
      mocks: [
        {
          provide: AssignedComponentService,
          useValue: service,
        },
      ],
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should properly return an empty AssignedComponent list', async () => {
    expect.hasAssertions();

    service.get.mockResolvedValue(Promise.resolve([]));

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/assignedComponents',
      method: 'GET',
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify([]));
  });

  it('should properly return a 404 regarding the request of a AssignedComponent based on its id', async () => {
    expect.hasAssertions();

    service.getById.mockResolvedValue(null);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/assignedComponents/23',
      method: 'GET',
    });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Entity not found');
  });

  it('should properly return a 200 regarding the creation of a AssignedComponent', async () => {
    expect.hasAssertions();

    const body: Partial<AssignedComponent> = {
      assignedComponentId: 23,
      description: 'description',
      itemNumber: 'item',
    };

    service.createOrUpdate.mockResolvedValue(body);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/assignedComponents',
      method: 'POST',
      payload: {
        description: 'description',
        itemNumber: 'item',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(body));
  });

  it('should properly return a 200 regarding the update of a AssignedComponent', async () => {
    expect.hasAssertions();

    const body: Partial<AssignedComponent> = {
      assignedComponentId: 23,
      description: 'description',
      itemNumber: 'item',
    };

    service.createOrUpdate.mockResolvedValue(body);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/assignedComponents',
      method: 'PUT',
      payload: {
        assignedComponentId: 23,
        description: 'description',
        itemNumber: 'item',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(body));
  });

  it('should properly return a 200 regarding the deletion of a AssignedComponent', async () => {
    expect.hasAssertions();

    service.deleteBy.mockResolvedValue(Promise.resolve());

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/assignedComponents/23',
      method: 'DELETE',
    });

    expect(result.statusCode).toBe(200);
  });
});
