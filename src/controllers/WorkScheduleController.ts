/* eslint-disable no-useless-constructor */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  Controller, DELETE, GET, POST, PUT,
} from 'fastify-decorators';
import * as FluentJsonSchema from 'fluent-json-schema';

import { WorkSchedule, WorkScheduleInput } from 'cps-common-models/dist/src/entities/WorkSchedule.js';
import { WorkScheduleService } from 'cps-common-models/dist/src/services/WorkScheduleService.js';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/workSchedules')
export class WorkScheduleController {
  constructor(private service: WorkScheduleService) { }

  @GET('/', {
    schema: {
      tags: ['Work Schedule'],
      description: 'Returns all the Work Schedules from the database',
      summary: 'Returns all the Work Schedules from the database',
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
  }}>, reply: FastifyReply): Promise<Pagination<WorkSchedule>> {
    const paginationInfo = buildPaginationInfo(reply, request);
    return this.service.get(undefined, paginationInfo);
  }

  @GET(
    '/:workScheduleId',
    {
      schema: {
        tags: ['Work Schedule'],
        description: 'Returns the Work Schedule information based on the workScheduleId',
        summary: 'Returns the Work Schedule information based on the workScheduleId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('workScheduleId', Schema.number().required()),
      },
    }
  )
  async getById(request: FastifyRequest<{ Params: { workScheduleId: number } }>, reply: FastifyReply): Promise<WorkSchedule | null> {
    try {
      const message: WorkSchedule | null = await this.service.getById(request.params.workScheduleId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Work Schedule'],
        description: 'Creates a new Work Schedule based on the given payload',
        summary: 'Creates a new Work Schedule based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: WorkScheduleInput }>): Promise<WorkSchedule> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Work Schedule'],
        description: 'Update an existing Work Schedule based on the given payload',
        summary: 'Update an existing Work Schedule based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: WorkSchedule }>): Promise<WorkSchedule> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:workScheduleId',
    {
      schema: {
        tags: ['Work Schedule'],
        description: 'Delete an existing Work Schedule given the related workScheduleId',
        summary: 'Delete an existing Work Schedule given the related workScheduleId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('workScheduleId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { workScheduleId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.workScheduleId);

    reply.status(200).send();
  }
}
