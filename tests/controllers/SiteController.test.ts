/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import 'isomorphic-fetch';
import 'jest-extended';
import { configureControllerTest, FastifyInstanceWithController } from '@fastify-decorators/simple-di/testing';
import { SiteService } from 'cps-common-models/dist/src/services/SiteService.js';
import { Site } from 'cps-common-models/dist/src/entities/Site.js';
import { SiteController } from '../../src/controllers/SiteController.js';

describe('test SiteController', () => {
  let instance: FastifyInstanceWithController<SiteController>;

  const siteService = {
    get: jest.fn(),
    getById: jest.fn(),
    init: jest.fn(),
    deleteBy: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  beforeAll(async () => {
    instance = await configureControllerTest({
      controller: SiteController,
      mocks: [
        {
          provide: SiteService,
          useValue: siteService,
        },
      ],
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should properly return an empty Site list', async () => {
    expect.hasAssertions();

    const sites: Site[] = [];
    siteService.get.mockResolvedValue(Promise.resolve(sites));

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/sites',
      method: 'GET',
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify([]));

    jest.resetAllMocks();
  });

  it('should properly return a 404 regarding the request of a Site based on its site_id', async () => {
    expect.hasAssertions();

    siteService.getById.mockResolvedValue(null);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/sites/23',
      method: 'GET',
    });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Entity not found');

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the creation of a Site', async () => {
    expect.hasAssertions();

    const site: Partial<Site> = {
      siteId: 23,
      siteName: 'RANK BANKS',
    };
    siteService.createOrUpdate.mockResolvedValue(site);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/sites',
      method: 'POST',
      payload: {
        siteName: 'RANK BANKS',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(site));

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the update of a Site', async () => {
    expect.hasAssertions();

    const site: Partial<Site> = {
      siteId: 23,
      siteName: 'RANK BANKS',
    };
    siteService.createOrUpdate.mockResolvedValue(site);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/sites',
      method: 'PUT',
      payload: {
        siteId: 23,
        siteName: 'RANK BANKS',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(site));

    jest.resetAllMocks();
  });

  it('should properly return a 200 regarding the deletion of a Site', async () => {
    expect.hasAssertions();

    siteService.createOrUpdate.mockResolvedValue(Promise.resolve());

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/sites/23',
      method: 'DELETE',
    });

    expect(result.statusCode).toBe(200);

    jest.resetAllMocks();
  });
});
