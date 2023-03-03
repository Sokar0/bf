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

import { AssignedOperationDto } from 'cps-common-models/dist/src/domain/dto/AssignedOperationDto.js';
import { AssignedOperations } from 'cps-common-models/dist/src/entities/AssignedOperations.js';
import { AssignedOperationsService } from 'cps-common-models/dist/src/services/AssignedOperationsService.js';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/assignedOperations')
export class AssignedOperationsController {
  constructor(private service: AssignedOperationsService) { }

  @GET('/', {
    schema: {
      tags: ['Assigned Operations'],
      description: 'Returns all the Assigned Operations from the database',
      summary: 'Returns all the Assigned Operations from the database',
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
  }}>, reply: FastifyReply): Promise<Pagination<AssignedOperations>> {
    const paginationInfo = buildPaginationInfo(reply, request);
    return this.service.get(undefined, paginationInfo);
  }

  @GET(
    '/:assignedOperationsId',
    {
      schema: {
        tags: ['Assigned Operations'],
        description: 'Returns the Assigned Operations information based on the id',
        summary: 'Returns the Assigned Operations information based on the id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('assignedOperationsId', Schema.string().required()),
      },
    }
  )
  async getById(
    request: FastifyRequest<{ Params: { assignedOperationsId: number } }>,
    reply: FastifyReply
  ): Promise<AssignedOperations | null> {
    try {
      const message: AssignedOperations | null = await this.service.getById(request.params.assignedOperationsId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Assigned Operations'],
        description: 'Creates a new Assigned Operations based on the given payload',
        summary: 'Creates a new Assigned Operations based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.array(),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: AssignedOperationDto[] }>): Promise<AssignedOperations[]> {
    return this.service.assign(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Assigned Operations'],
        description: 'Update an existing Assigned Operations based on the given payload',
        summary: 'Update an existing Assigned Operations based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: AssignedOperations }>): Promise<AssignedOperations> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:assignedOperationsId',
    {
      schema: {
        tags: ['Assigned Operations'],
        description: 'Delete an existing Assigned Tool given the related id',
        summary: 'Delete an existing Assigned Tool given the related id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('assignedOperationsId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { assignedOperationsId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.assignedOperationsId);

    reply.status(200).send();
  }
}
