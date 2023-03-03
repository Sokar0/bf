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
  Asset, AssetInput,
} from 'cps-common-models/dist/src/entities/Asset.js';
import { Site } from 'cps-common-models/dist/src/entities/Site';
import { AssetService } from 'cps-common-models/dist/src/services/AssetService.js';
import { FindOptionsWhere } from 'typeorm';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/assets')
export class AssetController {
  constructor(private service: AssetService) { }

  @GET('/', {
    schema: {
      tags: ['Asset'],
      description: 'Returns all the Assets from the database',
      summary: 'Returns all the Assets from the database',
      consumes: ['application/json'],
      produces: ['application/json'],
      headers: Schema.object().prop('Authorization', Schema.string().required()),
      querystring: Schema.object()
        .prop('siteId', Schema.number())
        .prop('page', Schema.number().description('Indicates the page to be shown [Default: 1]'))
        .prop('limit', Schema.number().description('Indicates the limit of records to be shown in a page [Default: 100]')),
    },
  })
  get(request: FastifyRequest<{Querystring: {
    siteId?: number,
    page?: number,
    limit?: number,
  }}>, reply: FastifyReply): Promise<Pagination<Asset>> {
    const relations: string[] = [];
    const where: FindOptionsWhere<Asset> = {};

    if (request.query.siteId) {
      const whereSite: FindOptionsWhere<Site> = {};
      whereSite.siteId = request.query.siteId;

      relations.push('site');
      where.site = whereSite;
    }

    return this.service.get(
      { relations, where },
      buildPaginationInfo(reply, request)
    );
  }

  @GET(
    '/:asset_id',
    {
      schema: {
        tags: ['Asset'],
        description: 'Returns the Asset information based on the id',
        summary: 'Returns the Asset information based on the id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('asset_id', Schema.string().required()),
      },
    }
  )
  async getById(
    request: FastifyRequest<{ Params: { assetId: number } }>,
    reply: FastifyReply
  ): Promise<Asset | null> {
    try {
      const message: Asset | null = await this.service.getById(request.params.assetId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Asset'],
        description: 'Creates a new Asset based on the given payload',
        summary: 'Creates a new Asset based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: AssetInput }>): Promise<Asset> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Asset'],
        description: 'Update an existing Asset based on the given payload',
        summary: 'Update an existing Asset based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: Asset }>): Promise<Asset> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:assetId',
    {
      schema: {
        tags: ['Asset'],
        description: 'Delete an existing Asset given the related id',
        summary: 'Delete an existing Asset given the related id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('assetId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { assetId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.assetId);

    reply.status(200).send();
  }
}
