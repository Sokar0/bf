/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import 'isomorphic-fetch';
import 'jest-extended';
import { configureControllerTest, FastifyInstanceWithController } from '@fastify-decorators/simple-di/testing';
import { WorkScheduleHumanResourceService } from 'cps-common-models/dist/src/services/WorkScheduleHumanResourceService.js';
import { WorkScheduleHumanResource } from 'cps-common-models/dist/src/entities/WorkScheduleHumanResource.js';
import { WorkScheduleHumanResourceController } from '../../src/controllers/WorkScheduleHumanResourceController.js';

describe('test WorkScheduleHumanResourceController', () => {
  let instance: FastifyInstanceWithController<WorkScheduleHumanResourceController>;

  const service = {
    get: jest.fn(),
    getById: jest.fn(),
    init: jest.fn(),
    deleteBy: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  beforeAll(async () => {
    instance = await configureControllerTest({
      controller: WorkScheduleHumanResourceController,
      mocks: [
        {
          provide: WorkScheduleHumanResourceService,
          useValue: service,
        },
      ],
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should properly return an empty WorkScheduleHumanResource list', async () => {
    expect.hasAssertions();

    service.get.mockResolvedValue(Promise.resolve([]));

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/workScheduleHumanResources',
      method: 'GET',
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify([]));
  });

  it('should properly return a 404 regarding the request of a WorkScheduleHumanResource based on its id', async () => {
    expect.hasAssertions();

    service.getById.mockResolvedValue(null);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/workScheduleHumanResources/23',
      method: 'GET',
    });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Entity not found');
  });

  it('should properly return a 200 regarding the creation of a WorkScheduleHumanResource', async () => {
    expect.hasAssertions();

    const body: Partial<WorkScheduleHumanResource> = {
      workScheduleHumanResourceId: 23,
      workScheduleId: 1,
    };

    service.createOrUpdate.mockResolvedValue(body);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/workScheduleHumanResources',
      method: 'POST',
      payload: {
        workScheduleId: 1,
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(body));
  });

  it('should properly return a 200 regarding the update of a WorkScheduleHumanResource', async () => {
    expect.hasAssertions();

    const body: Partial<WorkScheduleHumanResource> = {
      workScheduleHumanResourceId: 23,
      workScheduleId: 1,
    };

    service.createOrUpdate.mockResolvedValue(body);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/workScheduleHumanResources',
      method: 'PUT',
      payload: {
        workScheduleHumanResourceId: 23,
        workScheduleId: 1,
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(body));
  });

  it('should properly return a 200 regarding the deletion of a WorkScheduleHumanResource', async () => {
    expect.hasAssertions();

    service.deleteBy.mockResolvedValue(Promise.resolve());

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/workScheduleHumanResources/23',
      method: 'DELETE',
    });

    expect(result.statusCode).toBe(200);
  });
});
