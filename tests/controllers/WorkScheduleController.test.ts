/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import 'isomorphic-fetch';
import 'jest-extended';
import { configureControllerTest, FastifyInstanceWithController } from '@fastify-decorators/simple-di/testing';
import { WorkScheduleService } from 'cps-common-models/dist/src/services/WorkScheduleService.js';
import { WorkSchedule } from 'cps-common-models/dist/src/entities/WorkSchedule.js';
import { WorkScheduleController } from '../../src/controllers/WorkScheduleController.js';

describe('test WorkScheduleController', () => {
  let instance: FastifyInstanceWithController<WorkScheduleController>;

  const workScheduleService = {
    get: jest.fn(),
    getById: jest.fn(),
    init: jest.fn(),
    deleteBy: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  beforeAll(async () => {
    instance = await configureControllerTest({
      controller: WorkScheduleController,
      mocks: [
        {
          provide: WorkScheduleService,
          useValue: workScheduleService,
        },
      ],
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should properly return an empty WorkSchedule list', async () => {
    expect.hasAssertions();

    const workSchedules: WorkSchedule[] = [];
    workScheduleService.get.mockResolvedValue(Promise.resolve(workSchedules));

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/workSchedules',
      method: 'GET',
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify([]));

    jest.resetAllMocks();
  });

  it('should properly return a 404 regarding the request of a WorkSchedule based on its workSchedule_id', async () => {
    expect.hasAssertions();

    workScheduleService.getById.mockResolvedValue(null);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/workSchedules/23',
      method: 'GET',
    });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Entity not found');

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the creation of a WorkSchedule', async () => {
    expect.hasAssertions();

    const workSchedule: Partial<WorkSchedule> = {
      workScheduleId: 23,
      weekNumber: 1,
    };
    workScheduleService.createOrUpdate.mockResolvedValue(workSchedule);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/workSchedules',
      method: 'POST',
      payload: {
        weekNumber: 1,
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(workSchedule));

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the update of a WorkSchedule', async () => {
    expect.hasAssertions();

    const workSchedule: Partial<WorkSchedule> = {
      workScheduleId: 23,
      weekNumber: 1,
    };
    workScheduleService.createOrUpdate.mockResolvedValue(workSchedule);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/workSchedules',
      method: 'PUT',
      payload: {
        workScheduleId: 23,
        weekNumber: 1,
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(workSchedule));

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the deletion of a WorkSchedule', async () => {
    expect.hasAssertions();

    workScheduleService.createOrUpdate.mockResolvedValue(Promise.resolve());

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/workSchedules/23',
      method: 'DELETE',
    });

    expect(result.statusCode).toBe(200);

    jest.resetAllMocks();
  });
});
