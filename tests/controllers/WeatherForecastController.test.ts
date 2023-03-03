/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import 'isomorphic-fetch';
import 'jest-extended';
import { configureControllerTest, FastifyInstanceWithController } from '@fastify-decorators/simple-di/testing';
import { WeatherForecastService } from 'cps-common-models/dist/src/services/WeatherForecastService.js';
import { WeatherForecast } from 'cps-common-models/dist/src/entities/WeatherForecast.js';
import { WeatherForecastController } from '../../src/controllers/WeatherForecastController.js';

describe('test WeatherForecastController', () => {
  let instance: FastifyInstanceWithController<WeatherForecastController>;

  const service = {
    get: jest.fn(),
    getById: jest.fn(),
    init: jest.fn(),
    deleteBy: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  beforeAll(async () => {
    instance = await configureControllerTest({
      controller: WeatherForecastController,
      mocks: [
        {
          provide: WeatherForecastService,
          useValue: service,
        },
      ],
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should properly return an empty WeatherForecast list', async () => {
    expect.hasAssertions();

    service.get.mockResolvedValue(Promise.resolve([]));

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/weatherForecasts',
      method: 'GET',
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify([]));
  });

  it('should properly return a 404 regarding the request of a WeatherForecast based on its id', async () => {
    expect.hasAssertions();

    service.getById.mockResolvedValue(null);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/weatherForecasts/23',
      method: 'GET',
    });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Entity not found');
  });

  it('should properly return a 200 regarding the creation of a WeatherForecast', async () => {
    expect.hasAssertions();

    const body: Partial<WeatherForecast> = {
      weatherForecastId: 23,
      createdAt: new Date(),
    };

    service.createOrUpdate.mockResolvedValue(body);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/weatherForecasts',
      method: 'POST',
      payload: {
        createdAt: new Date(),
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(body));
  });

  it('should properly return a 200 regarding the update of a WeatherForecast', async () => {
    expect.hasAssertions();

    const body: Partial<WeatherForecast> = {
      weatherForecastId: 23,
      createdAt: new Date(),
    };

    service.createOrUpdate.mockResolvedValue(body);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/weatherForecasts',
      method: 'PUT',
      payload: {
        weatherForecastId: 23,
        createdAt: new Date(),
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(body));
  });

  it('should properly return a 200 regarding the deletion of a WeatherForecast', async () => {
    expect.hasAssertions();

    service.deleteBy.mockResolvedValue(Promise.resolve());

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/weatherForecasts/23',
      method: 'DELETE',
    });

    expect(result.statusCode).toBe(200);
  });
});
