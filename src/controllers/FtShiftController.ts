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
  FtShift, FtShiftInput,
} from 'cps-common-models/dist/src/entities/FtShift.js';
import { FtShiftService } from 'cps-common-models/dist/src/services/FtShiftService.js';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/shifts')
export class FtShiftController {
  constructor(private service: FtShiftService) { }

  @GET('/', {
    schema: {
      tags: ['Shift'],
      description: 'Returns all the Shifts from the database',
      summary: 'Returns all the Shifts from the database',
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
  }}>, reply: FastifyReply): Promise<Pagination<FtShift>> {
    const paginationInfo = buildPaginationInfo(reply, request);
    return this.service.get(undefined, paginationInfo);
  }

  @GET(
    '/:shiftId',
    {
      schema: {
        tags: ['Shift'],
        description: 'Returns the Shift information based on the id',
        summary: 'Returns the Shift information based on the id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('shiftId', Schema.string().required()),
      },
    }
  )
  async getById(
    request: FastifyRequest<{ Params: { shiftId: number } }>,
    reply: FastifyReply
  ): Promise<FtShift | null> {
    try {
      const message: FtShift | null = await this.service.getById(request.params.shiftId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Shift'],
        description: 'Creates a new Shift based on the given payload',
        summary: 'Creates a new Shift based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: FtShiftInput }>): Promise<FtShift> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Shift'],
        description: 'Update an existing Shift based on the given payload',
        summary: 'Update an existing Shift based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: FtShift }>): Promise<FtShift> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:shiftId',
    {
      schema: {
        tags: ['Shift'],
        description: 'Delete an existing Shift given the related id',
        summary: 'Delete an existing Shift given the related id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('shiftId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { shiftId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.shiftId);

    reply.status(200).send();
  }
}
