/* eslint-disable no-useless-constructor */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  Controller, DELETE, GET, POST, PUT,
} from 'fastify-decorators';
import * as FluentJsonSchema from 'fluent-json-schema';
import * as order from 'typeorm/find-options/FindOptionsOrder';

import { ServiceNotificationDetails } from 'cps-common-models/dist/src/domain/dto/ServiceNotificationDetails.js';
import { Asset } from 'cps-common-models/dist/src/entities/Asset.js';
import { Country } from 'cps-common-models/dist/src/entities/Country.js';
import { Hub } from 'cps-common-models/dist/src/entities/Hub.js';
import { ServiceNotification, ServiceNotificationInput } from 'cps-common-models/dist/src/entities/ServiceNotification.js';
import { Site } from 'cps-common-models/dist/src/entities/Site.js';
import { ServiceNotificationService } from 'cps-common-models/dist/src/services/ServiceNotificationService.js';
import { FindOptionsWhere } from 'typeorm';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

const SORT_FIELDS = {
  requiredStart: 'Requirement Start Date',
  priority: 'Priority',
};

const SORT_TYPE = {
  ASC: 'ASC',
  DESC: 'DESC',
};

function buildSortingConfig(field?: string, direction?: string): order.FindOptionsOrder<ServiceNotification> {
  const sortType: order.FindOptionsOrderValue = {
    direction: (direction && direction === 'DESC') ? 'DESC' : 'ASC',
  };

  let sortField: order.FindOptionsOrder<ServiceNotification>;

  switch (field) {
    case SORT_FIELDS.priority:
      sortField = { priority: sortType };
      break;
    default:
      sortField = { requiredStart: sortType };
  }

  return sortField;
}

@Controller('/serviceNotifications')
export class ServiceNotificationController {
  constructor(private service: ServiceNotificationService) { }

  @GET('/', {
    schema: {
      tags: ['Service Notification'],
      description: 'Returns all the Service Notifications from the database',
      summary: 'Returns all the Service Notifications from the database',
      consumes: ['application/json'],
      produces: ['application/json'],
      headers: Schema.object().prop('Authorization', Schema.string().required()),
      querystring: Schema.object()
        .prop('countryId', Schema.number().description('Get service notifications filtered by countryId'))
        .prop('hubId', Schema.number().description('Get service notifications filtered by hubId'))
        .prop('siteId', Schema.number().description('Indicates the site id to be used when filtering'))
        .prop('page', Schema.number().description('Indicates the page to be shown [Default: 1]'))
        .prop('limit', Schema.number().description('Indicates the limit of records to be shown in a page [Default: 100]'))
        .prop('sortField', Schema.enum(Object.values(SORT_FIELDS)).description('Indicates the field used for sorting the data fetched [Default: Requirement Start Date]').default(SORT_FIELDS.requiredStart))
        .prop('sortType', Schema.enum(Object.values(SORT_TYPE)).description('Indicates the sorting direction used for sorting the field [Default: ASC]').default(SORT_TYPE.ASC)),
    },
  })
  async get(request: FastifyRequest<{Querystring: {
    assetId?: number,
    countryId?: number,
    hubId?: number,
    siteId?: number,
    page?: number,
    limit?: number,
    sortField?: string,
    sortType?: string,
  }}>, reply: FastifyReply): Promise<Pagination<ServiceNotification>> {
    const relations: string[] = [];
    const where: FindOptionsWhere<ServiceNotification> = {};

    if (request.query.assetId) {
      const whereAsset: FindOptionsWhere<Asset> = {};
      whereAsset.assetId = request.query.assetId;

      relations.push('asset');
      where.asset = whereAsset;
    }

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
    '/:serviceNotificationId',
    {
      schema: {
        tags: ['Service Notification'],
        description: 'Returns the Service Notification information based on the serviceNotificationId',
        summary: 'Returns the Service Notification information based on the serviceNotificationId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('serviceNotificationId', Schema.number().required()),
      },
    }
  )
  async getById(request: FastifyRequest<{ Params: { serviceNotificationId: number } }>, reply: FastifyReply): Promise<ServiceNotification | null> {
    try {
      const message: ServiceNotification | null = await this.service.getById(request.params.serviceNotificationId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @GET(
    '/:serviceNotificationId/details',
    {
      schema: {
        tags: ['Service Notification'],
        description: 'Returns the Service Notification details based on the serviceNotificationId',
        summary: 'Returns the Service Notification details based on the serviceNotificationId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('serviceNotificationId', Schema.number().required()),
      },
    }
  )
  async getDetailsById(
    request: FastifyRequest<{ Params: { serviceNotificationId: number } }>,
    reply: FastifyReply,
  ): Promise<ServiceNotificationDetails | null> {
    try {
      const body: ServiceNotificationDetails | null = await this.service.getDetailsById(request.params.serviceNotificationId);
      return !body ? entityNotFoundResponse(reply, request) : body;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Service Notification'],
        description: 'Creates a new Service Notification based on the given payload',
        summary: 'Creates a new Service Notification based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: ServiceNotificationInput }>): Promise<ServiceNotification> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Service Notification'],
        description: 'Update an existing Service Notification based on the given payload',
        summary: 'Update an existing Service Notification based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: ServiceNotification }>): Promise<ServiceNotification> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:serviceNotificationId',
    {
      schema: {
        tags: ['Service Notification'],
        description: 'Delete an existing Service Notification given the related ServiceNotificationId',
        summary: 'Delete an existing Service Notification given the related ServiceNotificationId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('serviceNotificationId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { serviceNotificationId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.serviceNotificationId);

    reply.status(200).send();
  }
}
