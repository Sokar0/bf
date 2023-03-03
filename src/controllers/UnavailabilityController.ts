/* eslint-disable no-useless-constructor */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  Controller, DELETE, GET, POST, PUT,
} from 'fastify-decorators';
import * as FluentJsonSchema from 'fluent-json-schema';

import { Pagination } from 'nestjs-typeorm-paginate';
import { Unavailability, UnavailabilityInput } from 'cps-common-models/dist/src/entities/Unavailability.js';
import { UnavailabilityService } from 'cps-common-models/dist/src/services/UnavailabilityService.js';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/unavailabilities')
export class UnavailabilityController {
  constructor(private service: UnavailabilityService) { }

  @GET('/', {
    schema: {
      tags: ['Unavailability'],
      description: 'Returns all the Unavailabilities from the database',
      summary: 'Returns all the Unavailabilities from the database',
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
  }}>, reply: FastifyReply): Promise<Pagination<Unavailability>> {
    return this.service.get({}, buildPaginationInfo(reply, request));
  }

  @GET(
    '/:unavailabilityId',
    {
      schema: {
        tags: ['Unavailability'],
        description: 'Returns the Unavailability information based on the id',
        summary: 'Returns the Unavailability information based on the id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('unavailabilityId', Schema.string().required()),
      },
    }
  )
  async getById(
    request: FastifyRequest<{ Params: { unavailabilityId: number } }>,
    reply: FastifyReply
  ): Promise<Unavailability | null> {
    try {
      const message: Unavailability | null = await this.service.getById(request.params.unavailabilityId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Unavailability'],
        description: 'Creates a new Unavailability based on the given payload',
        summary: 'Creates a new Unavailability based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: UnavailabilityInput }>): Promise<Unavailability> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Unavailability'],
        description: 'Update an existing Unavailability based on the given payload',
        summary: 'Update an existing Unavailability based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: Unavailability }>): Promise<Unavailability> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:unavailabilityId',
    {
      schema: {
        tags: ['Unavailability'],
        description: 'Delete an existing Unavailability given the related id',
        summary: 'Delete an existing Unavailability given the related id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('unavailabilityId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { unavailabilityId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.unavailabilityId);
    reply.status(200).send();
  }
}
