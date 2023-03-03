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
  AssignedTool, AssignedToolInput,
} from 'cps-common-models/dist/src/entities/AssignedTool.js';
import { AssignedToolService } from 'cps-common-models/dist/src/services/AssignedToolService.js';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/assignedTools')
export class AssignedToolController {
  constructor(private service: AssignedToolService) { }

  @GET('/', {
    schema: {
      tags: ['Assigned Tool'],
      description: 'Returns all the Assigned Tools from the database',
      summary: 'Returns all the Assigned Tools from the database',
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
  }}>, reply: FastifyReply): Promise<Pagination<AssignedTool>> {
    const paginationInfo = buildPaginationInfo(reply, request);
    return this.service.get(undefined, paginationInfo);
  }

  @GET(
    '/:assignedToolId',
    {
      schema: {
        tags: ['Assigned Tool'],
        description: 'Returns the Assigned Tool information based on the id',
        summary: 'Returns the Assigned Tool information based on the id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('assignedToolId', Schema.string().required()),
      },
    }
  )
  async getById(
    request: FastifyRequest<{ Params: { assignedToolId: number } }>,
    reply: FastifyReply
  ): Promise<AssignedTool | null> {
    try {
      const message: AssignedTool | null = await this.service.getById(request.params.assignedToolId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Assigned Tool'],
        description: 'Creates a new Assigned Tool based on the given payload',
        summary: 'Creates a new Assigned Tool based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: AssignedToolInput }>): Promise<AssignedTool> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Assigned Tool'],
        description: 'Update an existing Assigned Tool based on the given payload',
        summary: 'Update an existing Assigned Tool based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: AssignedTool }>): Promise<AssignedTool> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:assignedToolId',
    {
      schema: {
        tags: ['Assigned Tool'],
        description: 'Delete an existing Assigned Tool given the related id',
        summary: 'Delete an existing Assigned Tool given the related id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('assignedToolId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { assignedToolId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.assignedToolId);

    reply.status(200).send();
  }
}
