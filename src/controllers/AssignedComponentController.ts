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
  AssignedComponent, AssignedComponentInput,
} from 'cps-common-models/dist/src/entities/AssignedComponent.js';
import { AssignedComponentService } from 'cps-common-models/dist/src/services/AssignedComponentService.js';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/assignedComponents')
export class AssignedComponentController {
  constructor(private service: AssignedComponentService) { }

  @GET('/', {
    schema: {
      tags: ['Assigned Component'],
      description: 'Returns all the Assigned Components from the database',
      summary: 'Returns all the Assigned Components from the database',
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
  }}>, reply: FastifyReply): Promise<Pagination<AssignedComponent>> {
    const paginationInfo = buildPaginationInfo(reply, request);
    return this.service.get(undefined, paginationInfo);
  }

  @GET(
    '/:assignedComponentId',
    {
      schema: {
        tags: ['Assigned Component'],
        description: 'Returns the Assigned Component information based on the id',
        summary: 'Returns the Assigned Component information based on the id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('assignedComponentId', Schema.string().required()),
      },
    }
  )
  async getById(
    request: FastifyRequest<{ Params: { assignedComponentId: number } }>,
    reply: FastifyReply
  ): Promise<AssignedComponent | null> {
    try {
      const message: AssignedComponent | null = await this.service.getById(request.params.assignedComponentId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Assigned Component'],
        description: 'Creates a new Assigned Component based on the given payload',
        summary: 'Creates a new Assigned Component based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: AssignedComponentInput }>): Promise<AssignedComponent> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Assigned Component'],
        description: 'Update an existing Assigned Component based on the given payload',
        summary: 'Update an existing Assigned Component based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: AssignedComponent }>): Promise<AssignedComponent> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:assignedComponentId',
    {
      schema: {
        tags: ['Assigned Component'],
        description: 'Delete an existing Assigned Component given the related id',
        summary: 'Delete an existing Assigned Component given the related id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('assignedComponentId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { assignedComponentId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.assignedComponentId);

    reply.status(200).send();
  }
}
