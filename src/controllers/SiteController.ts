/* eslint-disable no-useless-constructor */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  Controller, DELETE, GET, POST, PUT,
} from 'fastify-decorators';
import * as FluentJsonSchema from 'fluent-json-schema';

import { Hub } from 'cps-common-models/dist/src/entities/Hub.js';
import { Site, SiteInput } from 'cps-common-models/dist/src/entities/Site.js';
import { SiteService } from 'cps-common-models/dist/src/services/SiteService.js';
import { FindOptionsWhere } from 'typeorm';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/sites')
export class SiteController {
  constructor(private service: SiteService) { }

  @GET('/', {
    schema: {
      tags: ['Site'],
      description: 'Returns all the Sites from the database',
      summary: 'Returns all the Sites from the database',
      consumes: ['application/json'],
      produces: ['application/json'],
      headers: Schema.object().prop('Authorization', Schema.string().required()),
      querystring: Schema.object()
        .prop('hubId', Schema.number().description('Get sites filtered by hubId'))
        .prop('page', Schema.number().description('Indicates the page to be shown [Default: 1]'))
        .prop('limit', Schema.number().description('Indicates the limit of records to be shown in a page [Default: 100]')),
    },
  })
  get(request: FastifyRequest<{Querystring: {
    hubId?: number,
    page?: number,
    limit?: number,
  }}>, reply: FastifyReply): Promise<Pagination<Site>> {
    const relations: string[] = [];
    const where: FindOptionsWhere<Site> = {};

    if (request.query.hubId) {
      const whereHub: FindOptionsWhere<Hub> = {};
      whereHub.hubId = request.query.hubId;

      relations.push('hub');
      where.hub = whereHub;
    }

    return this.service.get(
      { relations, where },
      buildPaginationInfo(reply, request)
    );
  }

  @GET(
    '/:siteId',
    {
      schema: {
        tags: ['Site'],
        description: 'Returns the Site information based on the siteId',
        summary: 'Returns the Site information based on the siteId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('siteId', Schema.number().required()),
      },
    }
  )
  async getById(request: FastifyRequest<{ Params: { siteId: number } }>, reply: FastifyReply): Promise<Site | null> {
    try {
      const message: Site | null = await this.service.getById(request.params.siteId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Site'],
        description: 'Creates a new Site based on the given payload',
        summary: 'Creates a new Site based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: SiteInput }>): Promise<Site> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Site'],
        description: 'Update an existing Site based on the given payload',
        summary: 'Update an existing Site based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: Site }>): Promise<Site> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:siteId',
    {
      schema: {
        tags: ['Site'],
        description: 'Delete an existing Site given the related SiteId',
        summary: 'Delete an existing Site given the related SiteId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('siteId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { siteId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.siteId);

    reply.status(200).send();
  }
}
