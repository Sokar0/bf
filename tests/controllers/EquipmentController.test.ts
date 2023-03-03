/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import 'isomorphic-fetch';
import 'jest-extended';
import { configureControllerTest, FastifyInstanceWithController } from '@fastify-decorators/simple-di/testing';
import { EquipmentService } from 'cps-common-models/dist/src/services/EquipmentService.js';
import { Equipment } from 'cps-common-models/dist/src/entities/Equipment.js';
import { EquipmentController } from '../../src/controllers/EquipmentController.js';

describe('test EquipmentController', () => {
  let instance: FastifyInstanceWithController<EquipmentController>;

  const service = {
    get: jest.fn(),
    getById: jest.fn(),
    init: jest.fn(),
    deleteBy: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  beforeAll(async () => {
    instance = await configureControllerTest({
      controller: EquipmentController,
      mocks: [
        {
          provide: EquipmentService,
          useValue: service,
        },
      ],
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should properly return an empty Equipment list', async () => {
    expect.hasAssertions();

    service.get.mockResolvedValue(Promise.resolve([]));

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/equipments',
      method: 'GET',
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify([]));
  });

  it('should properly return a 404 regarding the request of a Equipment based on its id', async () => {
    expect.hasAssertions();

    service.getById.mockResolvedValue(null);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/equipments/23',
      method: 'GET',
    });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Entity not found');
  });

  it('should properly return a 200 regarding the creation of a Equipment', async () => {
    expect.hasAssertions();

    const body: Partial<Equipment> = {
      equipmentId: 23,
      description: 'Vessel',
    };

    service.createOrUpdate.mockResolvedValue(body);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/equipments',
      method: 'POST',
      payload: {
        description: 'Vessel',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(body));
  });

  it('should properly return a 200 regarding the update of a Equipment', async () => {
    expect.hasAssertions();

    const body: Partial<Equipment> = {
      equipmentId: 23,
      description: 'Vessel',
    };

    service.createOrUpdate.mockResolvedValue(body);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/equipments',
      method: 'PUT',
      payload: {
        equipment_id: 23,
        description: 'Vessel',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(body));
  });

  it('should properly return a 200 regarding the deletion of a Equipment', async () => {
    expect.hasAssertions();

    service.deleteBy.mockResolvedValue(Promise.resolve());

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/equipments/23',
      method: 'DELETE',
    });

    expect(result.statusCode).toBe(200);
  });
});
