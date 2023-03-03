/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import 'isomorphic-fetch';
import 'jest-extended';
import { configureControllerTest, FastifyInstanceWithController } from '@fastify-decorators/simple-di/testing';
import { AssignedEquipmentService } from 'cps-common-models/dist/src/services/AssignedEquipmentService.js';
import { AssignedEquipment } from 'cps-common-models/dist/src/entities/AssignedEquipment.js';
import { AssignedEquipmentController } from '../../src/controllers/AssignedEquipmentController.js';

describe('test AssignedEquipmentController', () => {
  let instance: FastifyInstanceWithController<AssignedEquipmentController>;

  const service = {
    get: jest.fn(),
    getById: jest.fn(),
    init: jest.fn(),
    deleteBy: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  beforeAll(async () => {
    instance = await configureControllerTest({
      controller: AssignedEquipmentController,
      mocks: [
        {
          provide: AssignedEquipmentService,
          useValue: service,
        },
      ],
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should properly return an empty AssignedEquipment list', async () => {
    expect.hasAssertions();

    service.get.mockResolvedValue(Promise.resolve([]));

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/assignedEquipments',
      method: 'GET',
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify([]));
  });

  it('should properly return a 404 regarding the request of a AssignedEquipment based on its id', async () => {
    expect.hasAssertions();

    service.getById.mockResolvedValue(null);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/assignedEquipments/23',
      method: 'GET',
    });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Entity not found');
  });

  it('should properly return a 200 regarding the update of a AssignedEquipment', async () => {
    expect.hasAssertions();

    const body: Partial<AssignedEquipment> = {
      assignedEquipmentId: 23,
      equipmentId: 2,
    };

    service.createOrUpdate.mockResolvedValue(body);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/assignedEquipments',
      method: 'PUT',
      payload: {
        assignedEquipmentId: 23,
        equipmentId: 2,
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(body));
  });

  it('should properly return a 200 regarding the deletion of a AssignedEquipment', async () => {
    expect.hasAssertions();

    service.deleteBy.mockResolvedValue(Promise.resolve());

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/assignedEquipments/23',
      method: 'DELETE',
    });

    expect(result.statusCode).toBe(200);
  });
});
