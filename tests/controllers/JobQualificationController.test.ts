/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import 'isomorphic-fetch';
import 'jest-extended';
import { configureControllerTest, FastifyInstanceWithController } from '@fastify-decorators/simple-di/testing';
import { JobQualificationService } from 'cps-common-models/dist/src/services/JobQualificationService.js';
import { JobQualification } from 'cps-common-models/dist/src/entities/JobQualification.js';
import { JobQualificationController } from '../../src/controllers/JobQualificationController.js';

describe('test JobQualificationController', () => {
  let instance: FastifyInstanceWithController<JobQualificationController>;

  const service = {
    get: jest.fn(),
    getById: jest.fn(),
    init: jest.fn(),
    deleteBy: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  beforeAll(async () => {
    instance = await configureControllerTest({
      controller: JobQualificationController,
      mocks: [
        {
          provide: JobQualificationService,
          useValue: service,
        },
      ],
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should properly return an empty JobQualification list', async () => {
    expect.hasAssertions();

    service.get.mockResolvedValue(Promise.resolve([]));

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/jobQualifications',
      method: 'GET',
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify([]));
  });

  it('should properly return a 404 regarding the request of a JobQualification based on its id', async () => {
    expect.hasAssertions();

    service.getById.mockResolvedValue(null);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/jobQualifications/23',
      method: 'GET',
    });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Entity not found');
  });

  it('should properly return a 200 regarding the creation of a JobQualification', async () => {
    expect.hasAssertions();

    const body: Partial<JobQualification> = {
      qualificationId: 23,
      validityDateStart: 'Vessel',
    };

    service.createOrUpdate.mockResolvedValue(body);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/jobQualifications',
      method: 'POST',
      payload: {
        validityDateStart: 'Vessel',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(body));
  });

  it('should properly return a 200 regarding the update of a JobQualification', async () => {
    expect.hasAssertions();

    const body: Partial<JobQualification> = {
      qualificationId: 23,
      validityDateStart: 'Vessel',
    };

    service.createOrUpdate.mockResolvedValue(body);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/jobQualifications',
      method: 'PUT',
      payload: {
        qualificationId: 23,
        validityDateStart: 'Vessel',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(body));
  });

  it('should properly return a 200 regarding the deletion of a JobQualification', async () => {
    expect.hasAssertions();

    service.deleteBy.mockResolvedValue(Promise.resolve());

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/jobQualifications/23',
      method: 'DELETE',
    });

    expect(result.statusCode).toBe(200);
  });
});
