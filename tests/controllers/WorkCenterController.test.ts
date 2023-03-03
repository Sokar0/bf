/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import 'isomorphic-fetch';
import 'jest-extended';
import { configureControllerTest, FastifyInstanceWithController } from '@fastify-decorators/simple-di/testing';
import { WorkCenterService } from 'cps-common-models/dist/src/services/WorkCenterService.js';
import { WorkCenter } from 'cps-common-models/dist/src/entities/WorkCenter.js';
import { WorkCenterController } from '../../src/controllers/WorkCenterController.js';

describe('test WorkCenterController', () => {
  let instance: FastifyInstanceWithController<WorkCenterController>;

  const workCenterService = {
    get: jest.fn(),
    getById: jest.fn(),
    init: jest.fn(),
    deleteBy: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  beforeAll(async () => {
    instance = await configureControllerTest({
      controller: WorkCenterController,
      mocks: [
        {
          provide: WorkCenterService,
          useValue: workCenterService,
        },
      ],
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should properly return an empty WorkCenter list', async () => {
    expect.hasAssertions();

    const workCenters: WorkCenter[] = [];
    workCenterService.get.mockResolvedValue(Promise.resolve(workCenters));

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/workCenters',
      method: 'GET',
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify([]));

    jest.resetAllMocks();
  });

  it('should properly return a 404 regarding the request of a WorkCenter based on its workCenter_id', async () => {
    expect.hasAssertions();

    workCenterService.getById.mockResolvedValue(null);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/workCenters/23',
      method: 'GET',
    });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Entity not found');

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the creation of a WorkCenter', async () => {
    expect.hasAssertions();

    const workCenter: Partial<WorkCenter> = {
      workCenterId: 23,
      description: 'description',
    };
    workCenterService.createOrUpdate.mockResolvedValue(workCenter);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/workCenters',
      method: 'POST',
      payload: {
        description: 'description',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(workCenter));

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the update of a WorkCenter', async () => {
    expect.hasAssertions();

    const workCenter: Partial<WorkCenter> = {
      workCenterId: 23,
      description: 'description',
    };
    workCenterService.createOrUpdate.mockResolvedValue(workCenter);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/workCenters',
      method: 'PUT',
      payload: {
        workCenterId: 23,
        description: 'description',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(workCenter));

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the deletion of a WorkCenter', async () => {
    expect.hasAssertions();

    workCenterService.createOrUpdate.mockResolvedValue(Promise.resolve());

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/workCenters/23',
      method: 'DELETE',
    });

    expect(result.statusCode).toBe(200);

    jest.resetAllMocks();
  });
});
