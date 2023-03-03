/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import 'isomorphic-fetch';
import 'jest-extended';
import { configureControllerTest, FastifyInstanceWithController } from '@fastify-decorators/simple-di/testing';
import { WorkScheduleTimeService } from 'cps-common-models/dist/src/services/WorkScheduleTimeService.js';
import { WorkScheduleTime } from 'cps-common-models/dist/src/entities/WorkScheduleTime.js';
import { WorkScheduleTimeController } from '../../src/controllers/WorkScheduleTimeController.js';

describe('test WorkScheduleTimeController', () => {
  let instance: FastifyInstanceWithController<WorkScheduleTimeController>;

  const workScheduleTimeService = {
    get: jest.fn(),
    getById: jest.fn(),
    init: jest.fn(),
    deleteBy: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  beforeAll(async () => {
    instance = await configureControllerTest({
      controller: WorkScheduleTimeController,
      mocks: [
        {
          provide: WorkScheduleTimeService,
          useValue: workScheduleTimeService,
        },
      ],
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should properly return an empty WorkScheduleTime list', async () => {
    expect.hasAssertions();

    const workScheduleTimes: WorkScheduleTime[] = [];
    workScheduleTimeService.get.mockResolvedValue(Promise.resolve(workScheduleTimes));

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/workScheduleTimes',
      method: 'GET',
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify([]));

    jest.resetAllMocks();
  });

  it('should properly return a 404 regarding the request of a WorkScheduleTime based on its workScheduleTime_id', async () => {
    expect.hasAssertions();

    workScheduleTimeService.getById.mockResolvedValue(null);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/workScheduleTimes/23',
      method: 'GET',
    });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Entity not found');

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the creation of a WorkScheduleTime', async () => {
    expect.hasAssertions();

    const workScheduleTime: Partial<WorkScheduleTime> = {
      workScheduleTimeId: 23,
      workBreakSchedule: '321',
    };
    workScheduleTimeService.createOrUpdate.mockResolvedValue(workScheduleTime);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/workScheduleTimes',
      method: 'POST',
      payload: {
        workBreakSchedule: '321',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(workScheduleTime));

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the update of a WorkScheduleTime', async () => {
    expect.hasAssertions();

    const workScheduleTime: Partial<WorkScheduleTime> = {
      workScheduleTimeId: 23,
      workBreakSchedule: '321',
    };
    workScheduleTimeService.createOrUpdate.mockResolvedValue(workScheduleTime);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/workScheduleTimes',
      method: 'PUT',
      payload: {
        workScheduleTimeId: 23,
        workBreakSchedule: '321',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(workScheduleTime));

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the deletion of a WorkScheduleTime', async () => {
    expect.hasAssertions();

    workScheduleTimeService.createOrUpdate.mockResolvedValue(Promise.resolve());

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/workScheduleTimes/23',
      method: 'DELETE',
    });

    expect(result.statusCode).toBe(200);

    jest.resetAllMocks();
  });
});
