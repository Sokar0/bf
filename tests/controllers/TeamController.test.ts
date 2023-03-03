/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import 'isomorphic-fetch';
import 'jest-extended';
import { configureControllerTest, FastifyInstanceWithController } from '@fastify-decorators/simple-di/testing';
import { TeamService } from 'cps-common-models/dist/src/services/TeamService.js';
import { Team } from 'cps-common-models/dist/src/entities/Team.js';
import { TeamController } from '../../src/controllers/TeamController.js';

describe('test TeamController', () => {
  let instance: FastifyInstanceWithController<TeamController>;

  const service = {
    get: jest.fn(),
    getById: jest.fn(),
    init: jest.fn(),
    deleteBy: jest.fn(),
    createOrUpdate: jest.fn(),
  };

  beforeAll(async () => {
    instance = await configureControllerTest({
      controller: TeamController,
      mocks: [
        {
          provide: TeamService,
          useValue: service,
        },
      ],
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should properly return an empty Team list', async () => {
    expect.hasAssertions();

    service.get.mockResolvedValue(Promise.resolve([]));

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/teams',
      method: 'GET',
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify([]));
  });

  it('should properly return a 404 regarding the request of a Team based on its id', async () => {
    expect.hasAssertions();

    service.getById.mockResolvedValue(null);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/teams/23',
      method: 'GET',
    });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Entity not found');
  });

  it('should properly return a 200 regarding the creation of a Team', async () => {
    expect.hasAssertions();

    const body: Partial<Team> = {
      teamId: 23,
      teamName: 'Vessel',
    };

    service.createOrUpdate.mockResolvedValue(body);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/teams',
      method: 'POST',
      payload: {
        teamName: 'Vessel',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(body));
  });

  it('should properly return a 200 regarding the update of a Team', async () => {
    expect.hasAssertions();

    const body: Partial<Team> = {
      teamId: 23,
      teamName: 'Vessel',
    };

    service.createOrUpdate.mockResolvedValue(body);

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/teams',
      method: 'PUT',
      payload: {
        teamId: 23,
        teamName: 'Vessel',
      },
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(body));
  });

  it('should properly return a 200 regarding the deletion of a Team', async () => {
    expect.hasAssertions();

    service.deleteBy.mockResolvedValue(Promise.resolve());

    const result = await instance.inject({
      headers: {
        Authorization: 'Bearer Token',
      },
      url: '/teams/23',
      method: 'DELETE',
    });

    expect(result.statusCode).toBe(200);
  });
});
