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

import { EquipmentDetails } from 'cps-common-models/dist/src/domain/dto/EquipmentDetails.js';
import { Country } from 'cps-common-models/dist/src/entities/Country.js';
import {
  Equipment, EquipmentInput,
} from 'cps-common-models/dist/src/entities/Equipment.js';
import { Hub } from 'cps-common-models/dist/src/entities/Hub.js';
import { Site } from 'cps-common-models/dist/src/entities/Site.js';
import { WorkCenter } from 'cps-common-models/dist/src/entities/WorkCenter.js';
import { EquipmentService } from 'cps-common-models/dist/src/services/EquipmentService.js';
import { FindOptionsWhere } from 'typeorm';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/equipments')
export class EquipmentController {
  constructor(private service: EquipmentService) { }

  @GET('/', {
    schema: {
      tags: ['Equipment'],
      description: 'Returns all the Equipments from the database',
      summary: 'Returns all the Equipments from the database',
      consumes: ['application/json'],
      produces: ['application/json'],
      headers: Schema.object().prop('Authorization', Schema.string().required()),
      querystring: Schema.object()
        .prop('countryId', Schema.number().description('Indicates the country id to be used when filtering'))
        .prop('hubId', Schema.number().description('Indicates the hub id to be used when filtering'))
        .prop('showWorkCenter', Schema.boolean().default(false).description('Allow the Work Center related to the Equipment to be presented along with the request [Default: false]'))
        .prop('siteId', Schema.number().description('Indicates the site id to be used when filtering'))
        .prop('type', Schema.string().description('Indicates the type to be used when filtering'))
        .prop('page', Schema.number().description('Indicates the page to be shown [Default: 1]'))
        .prop('limit', Schema.number().description('Indicates the limit of records to be shown in a page [Default: 100]')),
    },
  })
  get(request: FastifyRequest<{Querystring: {
    countryId?: number,
    hubId?: number,
    showWorkCenter?: boolean,
    siteId?: number,
    type?: string,
    page?: number,
    limit?: number,
  }}>, reply: FastifyReply): Promise<Pagination<Equipment>> {
    const relations: string[] = [];
    const where: FindOptionsWhere<Equipment> = {};

    if (request.query.showWorkCenter) {
      relations.push('workCenter');
    }

    if (request.query.countryId) {
      const whereCountry: FindOptionsWhere<Country> = {};
      whereCountry.countryId = request.query.countryId;

      const whereHub: FindOptionsWhere<Hub> = {};
      whereHub.country = whereCountry;

      const whereSite: FindOptionsWhere<Site> = {};
      whereSite.hub = whereHub;

      const whereWorkCenter: FindOptionsWhere<WorkCenter> = {};
      whereWorkCenter.site = whereSite;

      relations.push('workCenter.site.hub.country');
      where.workCenter = whereWorkCenter;
    }

    if (request.query.hubId) {
      const whereHub: FindOptionsWhere<Hub> = {};
      whereHub.hubId = request.query.hubId;

      const whereSite: FindOptionsWhere<Site> = {};
      whereSite.hub = whereHub;

      const whereWorkCenter: FindOptionsWhere<WorkCenter> = {};
      whereWorkCenter.site = whereSite;

      relations.push('workCenter');
      where.workCenter = whereWorkCenter;
    }

    if (request.query.siteId) {
      const whereWorkCenter: FindOptionsWhere<WorkCenter> = {};
      whereWorkCenter.siteId = request.query.siteId;

      relations.push('workCenter');
      where.workCenter = whereWorkCenter;
    }

    if (request.query.type) {
      where.objectType = request.query.type;
    }

    return this.service.get(
      { relations, where },
      buildPaginationInfo(reply, request)
    );
  }

  @GET(
    '/:equipment_id',
    {
      schema: {
        tags: ['Equipment'],
        description: 'Returns the Equipment information based on the id',
        summary: 'Returns the Equipment information based on the id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('equipment_id', Schema.string().required()),
      },
    }
  )
  async getById(
    request: FastifyRequest<{ Params: { equipment_id: number } }>,
    reply: FastifyReply
  ): Promise<Equipment | null> {
    try {
      const message: Equipment | null = await this.service.getById(request.params.equipment_id);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @GET(
    '/:equipmentId/details',
    {
      schema: {
        tags: ['Equipment'],
        description: 'Returns the Equipment details based on the equipmentId',
        summary: 'Returns the Equipment details based on the equipmentId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('equipmentId', Schema.number().required()),
      },
    }
  )
  async getDetailsById(
    request: FastifyRequest<{ Params: { equipmentId: number } }>,
    reply: FastifyReply,
  ): Promise<EquipmentDetails | null> {
    try {
      const body: EquipmentDetails | null = await this.service.getDetailsById(request.params.equipmentId);
      return !body ? entityNotFoundResponse(reply, request) : body;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Equipment'],
        description: 'Creates a new Equipment based on the given payload',
        summary: 'Creates a new Equipment based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: EquipmentInput }>): Promise<Equipment> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Equipment'],
        description: 'Update an existing Equipment based on the given payload',
        summary: 'Update an existing Equipment based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: Equipment }>): Promise<Equipment> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:equipment_id',
    {
      schema: {
        tags: ['Equipment'],
        description: 'Delete an existing Equipment given the related id',
        summary: 'Delete an existing Equipment given the related id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('equipment_id', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { equipment_id: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.equipment_id);

    reply.status(200).send();
  }
}
