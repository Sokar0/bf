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
  Country, CountryInput,
} from 'cps-common-models/dist/src/entities/Country.js';
import { CountryService } from 'cps-common-models/dist/src/services/CountryService.js';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';
import { logger } from '../utils/logger.js';

const Schema = FluentJsonSchema.default;

@Controller('/countries')
export class CountryController {
  constructor(private countryService: CountryService) { }

  @GET('/', {
    schema: {
      tags: ['Country'],
      description: 'Returns all the Countries from the database',
      summary: 'Returns all the Countries from the database',
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
  }}>, reply: FastifyReply): Promise<Pagination<Country>> {
    logger.info(request.headers);
    const paginationInfo = buildPaginationInfo(reply, request);
    return this.countryService.get(undefined, paginationInfo);
  }

  @GET(
    '/:countryId',
    {
      schema: {
        tags: ['Country'],
        description: 'Returns the Country information based on the countryId',
        summary: 'Returns the Country information based on the countryId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('countryId', Schema.number().required()),
      },
    }
  )
  async getById(
    request: FastifyRequest<{ Params: { countryId: number } }>,
    reply: FastifyReply
  ): Promise<Country | null> {
    try {
      const message: Country | null = await this.countryService.getById(request.params.countryId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Country'],
        description: 'Creates a new Country based on the given payload',
        summary: 'Creates a new Country based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: CountryInput }>): Promise<Country> {
    return this.countryService.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Country'],
        description: 'Update an existing Country based on the given payload',
        summary: 'Update an existing Country based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: Country }>): Promise<Country> {
    return this.countryService.createOrUpdate(request.body);
  }

  @DELETE(
    '/:countryId',
    {
      schema: {
        tags: ['Country'],
        description: 'Delete an existing Country given the related countryId',
        summary: 'Delete an existing Country given the related countryId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('countryId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { countryId: number } }>, reply: FastifyReply): Promise<void> {
    await this.countryService.deleteBy(request.params.countryId);

    reply.status(200).send();
  }
}
