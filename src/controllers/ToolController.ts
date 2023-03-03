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
  Tool, ToolInput,
} from 'cps-common-models/dist/src/entities/Tool.js';
import { ToolService } from 'cps-common-models/dist/src/services/ToolService.js';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/tools')
export class ToolController {
  constructor(private service: ToolService) { }

  @GET('/', {
    schema: {
      tags: ['Tool'],
      description: 'Returns all the Tools from the database',
      summary: 'Returns all the Tools from the database',
      consumes: ['application/json'],
      produces: ['application/json'],
      headers: Schema.object().prop('Authorization', Schema.string().required()),
      querystring: Schema.object()
        .prop('page', Schema.number().description('Indicates the page to be shown [Default: 1]'))
        .prop('limit', Schema.number().description('Indicates the limit of records to be shown in a page [Default: 100]')),
    },
  })
  get(request: FastifyRequest<{Querystring: {
    operationId?: number,
    page?: number,
    limit?: number,
  }}>, reply: FastifyReply): Promise<Pagination<Tool> | Tool[]> {
    const paginationInfo = buildPaginationInfo(reply, request);
    const { operationId } = request.query;

    return operationId ? this.service.getByOperationId(operationId) : this.service.get(undefined, paginationInfo);
  }

  @GET('/service-order', {
    schema: {
      tags: ['Tool'],
      description: 'Returns all the Tools from the database',
      summary: 'Returns all the Tools from the database',
      consumes: ['application/json'],
      produces: ['application/json'],
      headers: Schema.object().prop('Authorization', Schema.string().required()),
      querystring: Schema.object()
        .prop('page', Schema.number().description('Indicates the page to be shown [Default: 1]'))
        .prop('limit', Schema.number().description('Indicates the limit of records to be shown in a page [Default: 100]')),
    },
  })
  getByServiceOrderId(
    request: FastifyRequest<{Querystring: {
      id: number,
      page?: number,
      limit?: number,
    }}>,
    reply: FastifyReply
  ) {
    const paginationInfo = buildPaginationInfo(reply, request);
    return this.service.getByServiceOrderId(request.query.id, paginationInfo);
  }

  @GET(
    '/:toolId',
    {
      schema: {
        tags: ['Tool'],
        description: 'Returns the Tool information based on the id',
        summary: 'Returns the Tool information based on the id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('toolId', Schema.string().required()),
      },
    }
  )
  async getById(
    request: FastifyRequest<{ Params: { toolId: number } }>,
    reply: FastifyReply
  ): Promise<Tool | null> {
    try {
      const message: Tool | null = await this.service.getById(request.params.toolId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Tool'],
        description: 'Creates a new Tool based on the given payload',
        summary: 'Creates a new Tool based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: ToolInput }>): Promise<Tool> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Tool'],
        description: 'Update an existing Tool based on the given payload',
        summary: 'Update an existing Tool based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: Tool }>): Promise<Tool> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:toolId',
    {
      schema: {
        tags: ['Tool'],
        description: 'Delete an existing Tool given the related id',
        summary: 'Delete an existing Tool given the related id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('toolId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { toolId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.toolId);

    reply.status(200).send();
  }
}
