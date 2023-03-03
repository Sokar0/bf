/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import 'isomorphic-fetch';
import 'jest-extended';
import { configureControllerTest, FastifyInstanceWithController } from '@fastify-decorators/simple-di/testing';
import { MaterialService } from 'cps-common-models/dist/src/services/MaterialService.js';
import { Material } from 'cps-common-models/dist/src/entities/Material.js';
import { MaterialController } from '../../src/controllers/MaterialController.js';

describe('test MaterialController', () => {
  let instance: FastifyInstanceWithController<MaterialController>;

  const materialService = {
    get: jest.fn(),
    getById: jest.fn(),
    init: jest.fn(),
    deleteBy: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  beforeAll(async () => {
    instance = await configureControllerTest({
      controller: MaterialController,
      mocks: [
        {
          provide: MaterialService,
          useValue: materialService,
        },
      ],
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should properly return an empty Material list', async () => {
    expect.hasAssertions();

    const materials: Material[] = [];
    materialService.get.mockResolvedValue(Promise.resolve(materials));

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/materials',
      method: 'GET',
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify([]));

    jest.resetAllMocks();
  });

  it('should properly return a 404 regarding the request of a Material based on its material_id', async () => {
    expect.hasAssertions();

    materialService.getById.mockResolvedValue(null);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/materials/23',
      method: 'GET',
    });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Entity not found');

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the creation of a Material', async () => {
    expect.hasAssertions();

    const material: Partial<Material> = {
      materialId: 23,
      materialType: 'Vessel',
    };
    materialService.createOrUpdate.mockResolvedValue(material);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/materials',
      method: 'POST',
      payload: {
        materialType: 'Vessel',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(material));

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the update of a Material', async () => {
    expect.hasAssertions();

    const material: Partial<Material> = {
      materialId: 23,
      materialType: 'Vessel',
    };
    materialService.createOrUpdate.mockResolvedValue(material);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/materials',
      method: 'PUT',
      payload: {
        materialId: 23,
        materialType: 'Vessel',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(material));

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the deletion of a Material', async () => {
    expect.hasAssertions();

    materialService.createOrUpdate.mockResolvedValue(Promise.resolve());

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/materials/23',
      method: 'DELETE',
    });

    expect(result.statusCode).toBe(200);

    jest.resetAllMocks();
  });
});
