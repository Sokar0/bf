/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import 'isomorphic-fetch';
import 'jest-extended';
import { configureControllerTest, FastifyInstanceWithController } from '@fastify-decorators/simple-di/testing';
import { HumanResourceService } from 'cps-common-models/dist/src/services/HumanResourceService.js';
import { HumanResource } from 'cps-common-models/dist/src/entities/HumanResource.js';
import { HumanResourceController } from '../../src/controllers/HumanResourceController.js';

describe('test HumanResourceController', () => {
  let instance: FastifyInstanceWithController<HumanResourceController>;

  const service = {
    get: jest.fn(),
    getById: jest.fn(),
    init: jest.fn(),
    deleteBy: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  beforeAll(async () => {
    instance = await configureControllerTest({
      controller: HumanResourceController,
      mocks: [
        {
          provide: HumanResourceService,
          useValue: service,
        },
      ],
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should properly return an empty HumanResource list', async () => {
    expect.hasAssertions();

    service.get.mockResolvedValue(Promise.resolve([]));

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/humanResources',
      method: 'GET',
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify([]));
  });

  it('should properly return a 404 regarding the request of a HumanResource based on its id', async () => {
    expect.hasAssertions();

    service.getById.mockResolvedValue(null);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/humanResources/23',
      method: 'GET',
    });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Entity not found');
  });

  it('should properly return a 200 regarding the creation of a HumanResource', async () => {
    expect.hasAssertions();

    const body: Partial<HumanResource> = {
      humanResourceId: 23,
      firstName: 'Vessel',
    };

    service.createOrUpdate.mockResolvedValue(body);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/humanResources',
      method: 'POST',
      payload: {
        firstName: 'Vessel',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(body));
  });

  it('should properly return a 200 regarding the update of a HumanResource', async () => {
    expect.hasAssertions();

    const body: Partial<HumanResource> = {
      humanResourceId: 23,
      firstName: 'Vessel',
    };

    service.createOrUpdate.mockResolvedValue(body);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/humanResources',
      method: 'PUT',
      payload: {
        humanResourceId: 23,
        firstName: 'Vessel',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(body));
  });

  it('should properly return a 200 regarding the deletion of a HumanResource', async () => {
    expect.hasAssertions();

    service.deleteBy.mockResolvedValue(Promise.resolve());

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/humanResources/23',
      method: 'DELETE',
    });

    expect(result.statusCode).toBe(200);
  });
});
