/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import 'isomorphic-fetch';
import 'jest-extended';
import { configureControllerTest, FastifyInstanceWithController } from '@fastify-decorators/simple-di/testing';
import { MaterialStockService } from 'cps-common-models/dist/src/services/MaterialStockService.js';
import { MaterialStock } from 'cps-common-models/dist/src/entities/MaterialStock.js';
import { MaterialStockController } from '../../src/controllers/MaterialStockController.js';

describe('test MaterialStockController', () => {
  let instance: FastifyInstanceWithController<MaterialStockController>;

  const materialStockService = {
    get: jest.fn(),
    getById: jest.fn(),
    init: jest.fn(),
    deleteBy: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  beforeAll(async () => {
    instance = await configureControllerTest({
      controller: MaterialStockController,
      mocks: [
        {
          provide: MaterialStockService,
          useValue: materialStockService,
        },
      ],
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should properly return an empty Material Stock list', async () => {
    expect.hasAssertions();

    const materialstocks: MaterialStock[] = [];
    materialStockService.get.mockResolvedValue(Promise.resolve(materialstocks));

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/materialStocks',
      method: 'GET',
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify([]));

    jest.resetAllMocks();
  });

  it('should properly return a 404 regarding the request of a Material Stock based on its material_stock_id', async () => {
    expect.hasAssertions();

    materialStockService.getById.mockResolvedValue(null);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/materialStocks/23',
      method: 'GET',
    });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Entity not found');

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the creation of a MaterialStock', async () => {
    expect.hasAssertions();

    const materialstock: Partial<MaterialStock> = {
      materialStockId: 23,
      reservedQuantity: 0,
    };
    materialStockService.createOrUpdate.mockResolvedValue(materialstock);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/materialStocks',
      method: 'POST',
      payload: {
        reservedQuantity: 0,
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(materialstock));

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the update of a MaterialStock', async () => {
    expect.hasAssertions();

    const materialstock: Partial<MaterialStock> = {
      materialStockId: 23,
      reservedQuantity: 0,
    };
    materialStockService.createOrUpdate.mockResolvedValue(materialstock);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/materialStocks',
      method: 'PUT',
      payload: {
        materialStockId: 23,
        reservedQuantity: 0,
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(materialstock));

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the deletion of a MaterialStock', async () => {
    expect.hasAssertions();

    materialStockService.createOrUpdate.mockResolvedValue(Promise.resolve());

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/materialStocks/23',
      method: 'DELETE',
    });

    expect(result.statusCode).toBe(200);

    jest.resetAllMocks();
  });
});
