/* eslint-disable no-useless-constructor */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import {
  FastifyReply, FastifyRequest,
} from 'fastify';
import {
  Controller, DELETE, GET, POST, PUT,
} from 'fastify-decorators';
import * as FluentJsonSchema from 'fluent-json-schema';

import {
  JobPosition, JobPositionInput,
} from 'cps-common-models/dist/src/entities/JobPosition.js';
import { JobPositionService } from 'cps-common-models/dist/src/services/JobPositionService.js';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/jobPositions')
export class JobPositionController {
  constructor(private service: JobPositionService) { }

  @GET('/', {
    schema: {
      tags: ['Job Position'],
      description: 'Returns all the Job Positions from the database',
      summary: 'Returns all the Job Positions from the database',
      consumes: ['application/json'],
      produces: ['application/json'],
      headers: Schema.object().prop('Authorization', Schema.string().required()),
      querystring: Schema.object()
        .prop('page', Schema.number().description('Indicates the page to be shown [Default: 1]'))
        .prop('limit', Schema.number().description('Indicates the limit of records to be shown in a page [Default: 100]')),
    },
  })
  get(request: FastifyRequest<{Querystring: {
    page?: number,
    limit?: number,
  }}>, reply: FastifyReply): Promise<Pagination<JobPosition>> {
    const paginationInfo = buildPaginationInfo(reply, request);
    return this.service.get(undefined, paginationInfo);
  }

  @GET(
    '/:positionId',
    {
      schema: {
        tags: ['Job Position'],
        description: 'Returns the Job Position information based on the id',
        summary: 'Returns the Job Position information based on the id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('positionId', Schema.string().required()),
      },
    }
  )
  async getById(
    request: FastifyRequest<{ Params: { positionId: number } }>,
    reply: FastifyReply
  ): Promise<JobPosition | null> {
    try {
      const message: JobPosition | null = await this.service.getById(request.params.positionId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Job Position'],
        description: 'Creates a new Job Position based on the given payload',
        summary: 'Creates a new Job Position based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: JobPositionInput }>): Promise<JobPosition> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Job Position'],
        description: 'Update an existing Job Position based on the given payload',
        summary: 'Update an existing Job Position based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: JobPosition }>): Promise<JobPosition> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:positionId',
    {
      schema: {
        tags: ['Job Position'],
        description: 'Delete an existing Job Position given the related id',
        summary: 'Delete an existing Job Position given the related id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('positionId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { positionId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.positionId);

    reply.status(200).send();
  }
}
