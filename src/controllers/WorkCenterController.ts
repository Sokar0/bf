/* eslint-disable no-useless-constructor */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  Controller, DELETE, GET, POST, PUT,
} from 'fastify-decorators';
import * as FluentJsonSchema from 'fluent-json-schema';

import { WorkCenter, WorkCenterInput } from 'cps-common-models/dist/src/entities/WorkCenter.js';
import { WorkCenterService } from 'cps-common-models/dist/src/services/WorkCenterService.js';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/workCenters')
export class WorkCenterController {
  constructor(private service: WorkCenterService) { }

  @GET('/', {
    schema: {
      tags: ['Work Center'],
      description: 'Returns all the Work Centers from the database',
      summary: 'Returns all the Work Centers from the database',
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
  }}>, reply: FastifyReply): Promise<Pagination<WorkCenter>> {
    const paginationInfo = buildPaginationInfo(reply, request);
    return this.service.get(undefined, paginationInfo);
  }

  @GET(
    '/:workCenterId',
    {
      schema: {
        tags: ['Work Center'],
        description: 'Returns the Work Center information based on the workCenterId',
        summary: 'Returns the Work Center information based on the workCenterId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('workCenterId', Schema.number().required()),
      },
    }
  )
  async getById(request: FastifyRequest<{ Params: { workCenterId: number } }>, reply: FastifyReply): Promise<WorkCenter | null> {
    try {
      const message: WorkCenter | null = await this.service.getById(request.params.workCenterId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Work Center'],
        description: 'Creates a new Work Center based on the given payload',
        summary: 'Creates a new Work Center based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: WorkCenterInput }>): Promise<WorkCenter> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Work Center'],
        description: 'Update an existing Work Center based on the given payload',
        summary: 'Update an existing Work Center based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: WorkCenter }>): Promise<WorkCenter> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:workCenterId',
    {
      schema: {
        tags: ['Work Center'],
        description: 'Delete an existing Work Center given the related workCenterId',
        summary: 'Delete an existing Work Center given the related workCenterId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('workCenterId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { workCenterId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.workCenterId);

    reply.status(200).send();
  }
}
