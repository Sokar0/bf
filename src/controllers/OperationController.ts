/* eslint-disable no-useless-constructor */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  Controller, DELETE, GET, POST, PUT,
} from 'fastify-decorators';
import * as FluentJsonSchema from 'fluent-json-schema';

import { OperationDetails } from 'cps-common-models/dist/src/domain/dto/OperationDetails.js';
import { Operation, OperationInput } from 'cps-common-models/dist/src/entities/Operation.js';
import { ServiceOrder } from 'cps-common-models/dist/src/entities/ServiceOrder.js';
import { OperationService } from 'cps-common-models/dist/src/services/OperationService.js';
import { FindOptionsWhere } from 'typeorm';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/operations')
export class OperationController {
  constructor(private service: OperationService) { }

  @GET('/', {
    schema: {
      tags: ['Operation'],
      description: 'Returns all the Operations from the database',
      summary: 'Returns all the Operations from the database',
      consumes: ['application/json'],
      produces: ['application/json'],
      headers: Schema.object().prop('Authorization', Schema.string().required()),
      querystring: Schema.object()
        .prop('serviceOrderId', Schema.number().description('Get operations filtered by serviceOrderId'))
        .prop('page', Schema.number().description('Indicates the page to be shown [Default: 1]'))
        .prop('limit', Schema.number().description('Indicates the limit of records to be shown in a page [Default: 100]')),
    },
  })
  async get(request: FastifyRequest<{Querystring: {
    serviceOrderId?: number,
    page?: number,
    limit?: number,
  }}>, reply: FastifyReply): Promise<Pagination<Operation>> {
    const relations: string[] = [];
    const where: FindOptionsWhere<Operation> = {};

    if (request.query.serviceOrderId) {
      const whereServiceOrder: FindOptionsWhere<ServiceOrder> = {};
      whereServiceOrder.serviceOrderId = request.query.serviceOrderId;

      relations.push('serviceOrder');
      where.serviceOrder = whereServiceOrder;
    }

    return this.service.get(
      {
        order: {
          startDateTime: 'ASC',
          operationNumber: 'ASC',
        },
        relations,
        where,
      },
      buildPaginationInfo(reply, request)
    );
  }

  @GET(
    '/:operationId',
    {
      schema: {
        tags: ['Operation'],
        description: 'Returns the Operation information based on the operationId',
        summary: 'Returns the Operation information based on the operationId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('operationId', Schema.number().required()),
      },
    }
  )
  async getById(request: FastifyRequest<{ Params: { operationId: number } }>, reply: FastifyReply): Promise<Operation | null> {
    try {
      const message: Operation | null = await this.service.getById(request.params.operationId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @GET(
    '/:operationId/details',
    {
      schema: {
        tags: ['Operation'],
        description: 'Returns the Operation details based on the operationId',
        summary: 'Returns the Operation details based on the operationId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('operationId', Schema.number().required()),
      },
    }
  )
  async getDetailsById(
    request: FastifyRequest<{ Params: { operationId: number } }>,
    reply: FastifyReply,
  ): Promise<OperationDetails | null> {
    try {
      const body: OperationDetails | null = await this.service.getDetailsById(request.params.operationId);
      return !body ? entityNotFoundResponse(reply, request) : body;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Operation'],
        description: 'Creates a new Operation based on the given payload',
        summary: 'Creates a new Operation based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: OperationInput }>): Promise<Operation> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Operation'],
        description: 'Update an existing Operation based on the given payload',
        summary: 'Update an existing Operation based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: Operation }>): Promise<Operation> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:operationId',
    {
      schema: {
        tags: ['Operation'],
        description: 'Delete an existing Operation given the related OperationId',
        summary: 'Delete an existing Operation given the related OperationId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('operationId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { operationId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.operationId);

    reply.status(200).send();
  }
}
