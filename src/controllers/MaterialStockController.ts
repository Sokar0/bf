/* eslint-disable no-useless-constructor */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  Controller, DELETE, GET, POST, PUT,
} from 'fastify-decorators';
import * as FluentJsonSchema from 'fluent-json-schema';

import { MaterialStock, MaterialStockInput } from 'cps-common-models/dist/src/entities/MaterialStock.js';
import { MaterialStockService } from 'cps-common-models/dist/src/services/MaterialStockService.js';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/materialStocks')
export class MaterialStockController {
  constructor(private service: MaterialStockService) { }

  @GET('/', {
    schema: {
      tags: ['Material Stock'],
      description: 'Returns all the Material Stocks from the database',
      summary: 'Returns all the Material Stocks from the database',
      consumes: ['application/json'],
      produces: ['application/json'],
      headers: Schema.object().prop('Authorization', Schema.string().required()),
      querystring: Schema.object()
        .prop('page', Schema.number().description('Indicates the page to be shown [Default: 1]'))
        .prop('limit', Schema.number().description('Indicates the limit of records to be shown in a page [Default: 100]')),
    },
  })
  async get(request: FastifyRequest<{Querystring: {
    page?: number,
    limit?: number,
  }}>, reply: FastifyReply): Promise<Pagination<MaterialStock>> {
    const paginationInfo = buildPaginationInfo(reply, request);
    return this.service.get(undefined, paginationInfo);
  }

  @GET(
    '/:materialStockId',
    {
      schema: {
        tags: ['Material Stock'],
        description: 'Returns the Material Stock information based on the materialStockId',
        summary: 'Returns the Material Stock information based on the materialStockId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('materialStockId', Schema.number().required()),
      },
    }
  )
  async getById(request: FastifyRequest<{ Params: { materialStockId: number } }>, reply: FastifyReply): Promise<MaterialStock | null> {
    try {
      const message = await this.service.getById(request.params.materialStockId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Material Stock'],
        description: 'Creates a new Material Stock based on the given payload',
        summary: 'Creates a new Material Stock based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: MaterialStockInput }>): Promise<MaterialStock> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Material Stock'],
        description: 'Update an existing Material Stock based on the given payload',
        summary: 'Update an existing Material Stock based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: MaterialStock }>): Promise<MaterialStock> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:materialStockId',
    {
      schema: {
        tags: ['Material Stock'],
        description: 'Delete an existing Material Stock given the related materialStockId',
        summary: 'Delete an existing Material Stock given the related materialStockId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('materialStockId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { materialStockId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.materialStockId);

    reply.status(200).send();
  }
}
