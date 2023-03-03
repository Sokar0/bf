/* eslint-disable no-useless-constructor */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  Controller, DELETE, GET, POST, PUT,
} from 'fastify-decorators';
import * as FluentJsonSchema from 'fluent-json-schema';
import * as order from 'typeorm/find-options/FindOptionsOrder';

import { ServiceOrderDetails } from 'cps-common-models/dist/src/domain/dto/ServiceOrderDetails.js';
import { Asset } from 'cps-common-models/dist/src/entities/Asset.js';
import { Country } from 'cps-common-models/dist/src/entities/Country.js';
import { Hub } from 'cps-common-models/dist/src/entities/Hub.js';
import { ServiceOrder, ServiceOrderInput } from 'cps-common-models/dist/src/entities/ServiceOrder.js';
import { Site } from 'cps-common-models/dist/src/entities/Site.js';
import { ServiceOrderService } from 'cps-common-models/dist/src/services/ServiceOrderService.js';
import { FindOptionsWhere } from 'typeorm';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

const SORT_FIELDS = {
  basicStart: 'Basic Start Date',
  priority: 'Priority',
};

const SORT_TYPE = {
  ASC: 'ASC',
  DESC: 'DESC',
};

function buildSortingConfig(field?: string, direction?: string): order.FindOptionsOrder<ServiceOrder> {
  const sortType: order.FindOptionsOrderValue = {
    direction: (direction && direction === 'DESC') ? 'DESC' : 'ASC',
  };

  let sortField: order.FindOptionsOrder<ServiceOrder>;

  switch (field) {
    case SORT_FIELDS.priority:
      sortField = { priority: sortType };
      break;
    default:
      sortField = { basicStart: sortType };
  }

  return sortField;
}

@Controller('/serviceOrders')
export class ServiceOrderController {
  constructor(private service: ServiceOrderService) { }

  @GET('/', {
    schema: {
      tags: ['Service Order'],
      description: 'Returns all the Service Orders from the database',
      summary: 'Returns all the Service Orders from the database',
      consumes: ['application/json'],
      produces: ['application/json'],
      headers: Schema.object().prop('Authorization', Schema.string().required()),
      querystring: Schema.object()
        .prop('countryId', Schema.number().description('Indicates the country id to be used when filtering'))
        .prop('hubId', Schema.number().description('Get service orders filtered by hubId'))
        .prop('showOperations', Schema.boolean().default(false).description('Allow the Operations related to the Team to be presented along with the request [Default: false]'))
        .prop('siteId', Schema.number().description('Indicates the site id to be used when filtering'))
        .prop('page', Schema.number().description('Indicates the page to be shown [Default: 1]'))
        .prop('limit', Schema.number().description('Indicates the limit of records to be shown in a page [Default: 100]'))
        .prop('sortField', Schema.enum(Object.values(SORT_FIELDS)).description('Indicates the field used for sorting the data fetched [Default: Basic Start Date]').default(SORT_FIELDS.basicStart))
        .prop('sortType', Schema.enum(Object.values(SORT_TYPE)).description('Indicates the sorting direction used for sorting the field [Default: ASC]').default(SORT_TYPE.ASC)),
    },
  })
  async get(request: FastifyRequest<{Querystring: {
    countryId?: number,
    hubId?: number,
    showOperations?: boolean,
    siteId?: number,
    page?: number,
    limit?: number,
    sortField?: string,
    sortType?: string,
  }}>, reply: FastifyReply): Promise<Pagination<ServiceOrder>> {
    const relations: string[] = [];
    const where: FindOptionsWhere<ServiceOrder> = {};

    if (request.query.countryId) {
      const whereCountry: FindOptionsWhere<Country> = {};
      whereCountry.countryId = request.query.countryId;

      const whereHub: FindOptionsWhere<Hub> = {};
      whereHub.country = whereCountry;

      const whereSite: FindOptionsWhere<Site> = {};
      whereSite.hub = whereHub;

      const whereAsset: FindOptionsWhere<Asset> = {};
      whereAsset.site = whereSite;

      relations.push('asset');
      where.asset = whereAsset;
    }

    if (request.query.hubId) {
      const whereHub: FindOptionsWhere<Hub> = {};
      whereHub.hubId = request.query.hubId;

      const whereSite: FindOptionsWhere<Site> = {};
      whereSite.hub = whereHub;

      const whereAsset: FindOptionsWhere<Asset> = {};
      whereAsset.site = whereSite;

      relations.push('asset');
      where.asset = whereAsset;
    }

    if (request.query.showOperations) {
      relations.push('operations');
    }

    if (request.query.siteId) {
      const whereSite: FindOptionsWhere<Site> = {};
      whereSite.siteId = request.query.siteId;

      const whereAsset: FindOptionsWhere<Asset> = {};
      whereAsset.site = whereSite;

      relations.push('asset');
      where.asset = whereAsset;
    }

    return this.service.get(
      {
        order: buildSortingConfig(request.query.sortField, request.query.sortType),
        relations,
        where,
      },
      buildPaginationInfo(reply, request)
    );
  }

  @GET(
    '/:serviceOrderId',
    {
      schema: {
        tags: ['Service Order'],
        description: 'Returns the Service Order information based on the serviceOrderId',
        summary: 'Returns the Service Order information based on the serviceOrderId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('serviceOrderId', Schema.number().required()),
      },
    }
  )
  async getById(request: FastifyRequest<{ Params: { serviceOrderId: number } }>, reply: FastifyReply): Promise<ServiceOrder | null> {
    try {
      const message: ServiceOrder | null = await this.service.getById(request.params.serviceOrderId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @GET(
    '/:serviceOrderId/details',
    {
      schema: {
        tags: ['Service Order'],
        description: 'Returns the Service Order details based on the serviceOrderId',
        summary: 'Returns the Service Order details based on the serviceOrderId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('serviceOrderId', Schema.number().required()),
      },
    }
  )
  async getDetailsById(
    request: FastifyRequest<{ Params: { serviceOrderId: number } }>,
    reply: FastifyReply,
  ): Promise<ServiceOrderDetails | null> {
    try {
      const body: ServiceOrderDetails | null = await this.service.getDetailsById(request.params.serviceOrderId);
      return !body ? entityNotFoundResponse(reply, request) : body;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Service Order'],
        description: 'Creates a new Service Order based on the given payload',
        summary: 'Creates a new Service Order based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: ServiceOrderInput }>): Promise<ServiceOrder> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Service Order'],
        description: 'Update an existing Service Order based on the given payload',
        summary: 'Update an existing Service Order based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: ServiceOrder }>): Promise<ServiceOrder> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:serviceOrderId',
    {
      schema: {
        tags: ['Service Order'],
        description: 'Delete an existing Service Order given the related ServiceOrderId',
        summary: 'Delete an existing Service Order given the related ServiceOrderId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('serviceOrderId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { serviceOrderId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.serviceOrderId);

    reply.status(200).send();
  }
}
