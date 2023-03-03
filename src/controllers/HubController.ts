/* eslint-disable no-useless-constructor */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  Controller, DELETE, GET, POST, PUT,
} from 'fastify-decorators';
import * as FluentJsonSchema from 'fluent-json-schema';
import { Hub, HubInput } from 'cps-common-models/dist/src/entities/Hub.js';
import { Country } from 'cps-common-models/dist/src/entities/Country.js';
import { HubService } from 'cps-common-models/dist/src/services/HubService.js';
import { FindOptionsWhere } from 'typeorm';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/hubs')
export class HubController {
  constructor(private service: HubService) { }

  @GET('/', {
    schema: {
      tags: ['Hub'],
      description: 'Returns all the Hubs from the database',
      summary: 'Returns all the Hubs from the database',
      consumes: ['application/json'],
      produces: ['application/json'],
      headers: Schema.object().prop('Authorization', Schema.string().required()),
      querystring: Schema.object()
        .prop('countryId', Schema.number())
        .prop('type', Schema.string().description('Get hubs filtered by type [Offshore | Onshore]'))
        .prop('page', Schema.number().description('Indicates the page to be shown [Default: 1]'))
        .prop('limit', Schema.number().description('Indicates the limit of records to be shown in a page [Default: 100]')),
    },
  })
  get(request: FastifyRequest<{Querystring: {
    countryId?: number,
    type?: string,
    page?: number,
    limit?: number,
  }}>, reply: FastifyReply): Promise<Pagination<Hub>> {
    const relations: string[] = [];
    const where: FindOptionsWhere<Hub> = {};

    if (request.query.countryId) {
      const whereCountry: FindOptionsWhere<Country> = {};
      whereCountry.countryId = request.query.countryId;

      relations.push('country');
      where.country = whereCountry;
    }

    if (request.query.type) {
      where.hubType = request.query.type;
    }

    return this.service.get(
      { relations, where },
      buildPaginationInfo(reply, request)
    );
  }

  @GET(
    '/:hubId',
    {
      schema: {
        tags: ['Hub'],
        description: 'Returns the Hub information based on the hubId',
        summary: 'Returns the Hub information based on the hubId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('hubId', Schema.number().required()),
      },
    }
  )
  async getById(
    request: FastifyRequest<{ Params: { hubId: number } }>,
    reply: FastifyReply
  ): Promise<Hub | null> {
    try {
      const message: Hub | null = await this.service.getById(request.params.hubId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Hub'],
        description: 'Creates a new Hub based on the given payload',
        summary: 'Creates a new Hub based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: HubInput }>): Promise<Hub> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Hub'],
        description: 'Update an existing Hub based on the given payload',
        summary: 'Update an existing Hub based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: Hub }>): Promise<Hub> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:hubId',
    {
      schema: {
        tags: ['Hub'],
        description: 'Delete an existing Hub given the related hubId',
        summary: 'Delete an existing Hub given the related hubId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('hubId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { hubId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.hubId);

    reply.status(200).send();
  }
}
