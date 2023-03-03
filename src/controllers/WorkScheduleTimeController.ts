/* eslint-disable no-useless-constructor */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  Controller, DELETE, GET, POST, PUT,
} from 'fastify-decorators';
import * as FluentJsonSchema from 'fluent-json-schema';

import { WorkScheduleTime, WorkScheduleTimeInput } from 'cps-common-models/dist/src/entities/WorkScheduleTime.js';
import { WorkScheduleTimeService } from 'cps-common-models/dist/src/services/WorkScheduleTimeService.js';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/workScheduleTimes')
export class WorkScheduleTimeController {
  constructor(private service: WorkScheduleTimeService) { }

  @GET('/', {
    schema: {
      tags: ['Work Schedule Time'],
      description: 'Returns all the Work Schedule Times from the database',
      summary: 'Returns all the Work Schedule Times from the database',
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
  }}>, reply: FastifyReply): Promise<Pagination<WorkScheduleTime>> {
    const paginationInfo = buildPaginationInfo(reply, request);
    return this.service.get(undefined, paginationInfo);
  }

  @GET(
    '/:workScheduleTimeId',
    {
      schema: {
        tags: ['Work Schedule Time'],
        description: 'Returns the Work Schedule Time information based on the workScheduleTimeId',
        summary: 'Returns the Work Schedule Time information based on the workScheduleTimeId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('workScheduleTimeId', Schema.number().required()),
      },
    }
  )
  async getById(request: FastifyRequest<{ Params: { workScheduleTimeId: number } }>, reply: FastifyReply): Promise<WorkScheduleTime | null> {
    try {
      const message: WorkScheduleTime | null = await this.service.getById(request.params.workScheduleTimeId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Work Schedule Time'],
        description: 'Creates a new Work Schedule Time based on the given payload',
        summary: 'Creates a new Work Schedule Time based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: WorkScheduleTimeInput }>): Promise<WorkScheduleTime> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Work Schedule Time'],
        description: 'Update an existing Work Schedule Time based on the given payload',
        summary: 'Update an existing Work Schedule Time based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: WorkScheduleTime }>): Promise<WorkScheduleTime> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:workScheduleTimeId',
    {
      schema: {
        tags: ['Work Schedule Time'],
        description: 'Delete an existing Work Schedule Time given the related workScheduleTimeId',
        summary: 'Delete an existing Work Schedule Time given the related workScheduleTimeId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('workScheduleTimeId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { workScheduleTimeId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.workScheduleTimeId);

    reply.status(200).send();
  }
}
