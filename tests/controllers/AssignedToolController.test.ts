/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import 'isomorphic-fetch';
import 'jest-extended';
import { configureControllerTest, FastifyInstanceWithController } from '@fastify-decorators/simple-di/testing';
import { AssignedToolService } from 'cps-common-models/dist/src/services/AssignedToolService.js';
import { AssignedTool } from 'cps-common-models/dist/src/entities/AssignedTool.js';
import { AssignedToolController } from '../../src/controllers/AssignedToolController.js';

describe('test AssignedToolController', () => {
  let instance: FastifyInstanceWithController<AssignedToolController>;

  const service = {
    get: jest.fn(),
    getById: jest.fn(),
    init: jest.fn(),
    deleteBy: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  beforeAll(async () => {
    instance = await configureControllerTest({
      controller: AssignedToolController,
      mocks: [
        {
          provide: AssignedToolService,
          useValue: service,
        },
      ],
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should properly return an empty AssignedTool list', async () => {
    expect.hasAssertions();

    service.get.mockResolvedValue(Promise.resolve([]));

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/assignedTools',
      method: 'GET',
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify([]));
  });

  it('should properly return a 404 regarding the request of a AssignedTool based on its id', async () => {
    expect.hasAssertions();

    service.getById.mockResolvedValue(null);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/assignedTools/23',
      method: 'GET',
    });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Entity not found');
  });

  it('should properly return a 200 regarding the creation of a AssignedTool', async () => {
    expect.hasAssertions();

    const body: Partial<AssignedTool> = {
      assignedToolId: 23,
      equipmentProductionResourceTool: 'Vessel',
    };

    service.createOrUpdate.mockResolvedValue(body);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/assignedTools',
      method: 'POST',
      payload: {
        equipmentProductionResourceTool: 'Vessel',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(body));
  });

  it('should properly return a 200 regarding the update of a AssignedTool', async () => {
    expect.hasAssertions();

    const body: Partial<AssignedTool> = {
      assignedToolId: 23,
      equipmentProductionResourceTool: 'Vessel',
    };

    service.createOrUpdate.mockResolvedValue(body);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/assignedTools',
      method: 'PUT',
      payload: {
        assignedToolId: 23,
        equipmentProductionResourceTool: 'Vessel',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(body));
  });

  it('should properly return a 200 regarding the deletion of a AssignedTool', async () => {
    expect.hasAssertions();

    service.deleteBy.mockResolvedValue(Promise.resolve());

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/assignedTools/23',
      method: 'DELETE',
    });

    expect(result.statusCode).toBe(200);
  });
});
