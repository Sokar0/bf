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
  WorkScheduleHumanResource, WorkScheduleHumanResourceInput,
} from 'cps-common-models/dist/src/entities/WorkScheduleHumanResource.js';
import { WorkScheduleHumanResourceService } from 'cps-common-models/dist/src/services/WorkScheduleHumanResourceService.js';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/workScheduleHumanResources')
export class WorkScheduleHumanResourceController {
  constructor(private service: WorkScheduleHumanResourceService) { }

  @GET('/', {
    schema: {
      tags: ['Work Schedule Human Resource'],
      description: 'Returns all the Work Schedule Human Resources from the database',
      summary: 'Returns all the Work Schedule Human Resources from the database',
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
  }}>, reply: FastifyReply): Promise<Pagination<WorkScheduleHumanResource>> {
    const paginationInfo = buildPaginationInfo(reply, request);
    return this.service.get(undefined, paginationInfo);
  }

  @GET(
    '/:workScheduleHumanResourceId',
    {
      schema: {
        tags: ['Work Schedule Human Resource'],
        description: 'Returns the Work Schedule Human Resource information based on the id',
        summary: 'Returns the Work Schedule Human Resource information based on the id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('workScheduleHumanResourceId', Schema.string().required()),
      },
    }
  )
  async getById(
    request: FastifyRequest<{ Params: { workScheduleHumanResourceId: number } }>,
    reply: FastifyReply
  ): Promise<WorkScheduleHumanResource | null> {
    try {
      // eslint-disable-next-line max-len
      const message: WorkScheduleHumanResource | null = await this.service.getById(request.params.workScheduleHumanResourceId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Work Schedule Human Resource'],
        description: 'Creates a new Work Schedule Human Resource based on the given payload',
        summary: 'Creates a new Work Schedule Human Resource based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: WorkScheduleHumanResourceInput }>): Promise<WorkScheduleHumanResource> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Work Schedule Human Resource'],
        description: 'Update an existing Work Schedule Human Resource based on the given payload',
        summary: 'Update an existing Work Schedule Human Resource based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: WorkScheduleHumanResource }>): Promise<WorkScheduleHumanResource> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:workScheduleHumanResourceId',
    {
      schema: {
        tags: ['Work Schedule Human Resource'],
        description: 'Delete an existing Work Schedule Human Resource given the related id',
        summary: 'Delete an existing Work Schedule Human Resource given the related id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('workScheduleHumanResourceId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { workScheduleHumanResourceId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.workScheduleHumanResourceId);

    reply.status(200).send();
  }
}
