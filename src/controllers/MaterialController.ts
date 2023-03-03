/* eslint-disable no-useless-constructor */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  Controller, DELETE, GET, POST, PUT,
} from 'fastify-decorators';
import * as FluentJsonSchema from 'fluent-json-schema';

import { Material, MaterialInput } from 'cps-common-models/dist/src/entities/Material.js';
import { MaterialService } from 'cps-common-models/dist/src/services/MaterialService.js';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/materials')
export class MaterialController {
  constructor(private service: MaterialService) { }

  @GET('/', {
    schema: {
      tags: ['Material'],
      description: 'Returns all the Materials from the database',
      summary: 'Returns all the Materials from the database',
      consumes: ['application/json'],
      produces: ['application/json'],
      headers: Schema.object().prop('Authorization', Schema.string().required()),
      querystring: Schema.object()
        .prop('operationId', Schema.number().description('Indicates the operation id to be used when filtering'))
        .prop('page', Schema.number().description('Indicates the page to be shown [Default: 1]'))
        .prop('limit', Schema.number().description('Indicates the limit of records to be shown in a page [Default: 100]')),
    },
  })
  async get(request: FastifyRequest<{Querystring: {
    operationId?: number,
    page?: number,
    limit?: number,
  }}>, reply: FastifyReply): Promise<Pagination<Material> | Material[]> {
    const paginationInfo = buildPaginationInfo(reply, request);
    const { operationId } = request.query;

    return operationId ? this.service.getByOperationId(operationId) : this.service.get(undefined, paginationInfo);
  }

  @GET(
    '/:materialId',
    {
      schema: {
        tags: ['Material'],
        description: 'Returns the Material information based on the materialId',
        summary: 'Returns the Material information based on the materialId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('materialId', Schema.number().required()),
      },
    }
  )
  async getById(request: FastifyRequest<{ Params: { materialId: number } }>, reply: FastifyReply): Promise<Material | null> {
    try {
      const message: Material | null = await this.service.getById(request.params.materialId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Material'],
        description: 'Creates a new Material based on the given payload',
        summary: 'Creates a new Material based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: MaterialInput }>): Promise<Material> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Material'],
        description: 'Update an existing Material based on the given payload',
        summary: 'Update an existing Material based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: Material }>): Promise<Material> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:materialId',
    {
      schema: {
        tags: ['Material'],
        description: 'Delete an existing Material given the related MaterialId',
        summary: 'Delete an existing Material given the related MaterialId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('materialId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { materialId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.materialId);

    reply.status(200).send();
  }
}
