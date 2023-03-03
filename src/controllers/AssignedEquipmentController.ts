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

import { AssignedEquipmentDto } from 'cps-common-models/dist/src/domain/dto/AssignedEquipmentDto.js';
import { AssignedEquipment } from 'cps-common-models/dist/src/entities/AssignedEquipment.js';
import { AssignedEquipmentService } from 'cps-common-models/dist/src/services/AssignedEquipmentService.js';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/assignedEquipments')
export class AssignedEquipmentController {
  constructor(private service: AssignedEquipmentService) { }

  @GET('/', {
    schema: {
      tags: ['Assigned Equipment'],
      description: 'Returns all the Assigned Equipments from the database',
      summary: 'Returns all the Assigned Equipments from the database',
      consumes: ['application/json'],
      produces: ['application/json'],
      headers: Schema.object().prop('Authorization', Schema.string().required()),
      querystring: Schema.object()
        .prop('showHumanResources', Schema.boolean().default(false).description('Allow the Human Resources related to the Assigned Equipments to be presented along with the request [Default: false]'))
        .prop('showTeam', Schema.boolean().default(false).description('Allow the Team related to the Assigned Equipments to be presented along with the request [Default: false]'))
        .prop('page', Schema.number().description('Indicates the page to be shown [Default: 1]'))
        .prop('limit', Schema.number().description('Indicates the limit of records to be shown in a page [Default: 100]')),
    },
  })
  get(request: FastifyRequest<{Querystring: {
    showHumanResources?: boolean,
    showTeam?: boolean,
    page?: number,
    limit?: number,
  }}>, reply: FastifyReply): Promise<Pagination<AssignedEquipment>> {
    const relations: string[] = [];

    if (request.query.showHumanResources) {
      relations.push('humanResource');
    } if (request.query.showTeam) {
      relations.push('team');
    }

    return this.service.get({
      relations,
    }, buildPaginationInfo(reply, request));
  }

  @GET(
    '/:assignedEquipmentId',
    {
      schema: {
        tags: ['Assigned Equipment'],
        description: 'Returns the Assigned Equipment information based on the id',
        summary: 'Returns the Assigned Equipment information based on the id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('assignedEquipmentId', Schema.string().required()),
      },
    }
  )
  async getById(
    request: FastifyRequest<{ Params: { assignedEquipmentId: number } }>,
    reply: FastifyReply
  ): Promise<AssignedEquipment | null> {
    try {
      const message: AssignedEquipment | null = await this.service.getById(request.params.assignedEquipmentId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Assigned Equipment'],
        description: 'Creates a new Assigned Equipment based on the given payload',
        summary: 'Creates a new Assigned Equipment based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.array(),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: AssignedEquipmentDto[] }>): Promise<AssignedEquipment[]> {
    return this.service.assign(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Assigned Equipment'],
        description: 'Update an existing Assigned Equipment based on the given payload',
        summary: 'Update an existing Assigned Equipment based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: AssignedEquipment }>): Promise<AssignedEquipment> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:assignedEquipmentId',
    {
      schema: {
        tags: ['Assigned Equipment'],
        description: 'Delete an existing Assigned Equipment given the related id',
        summary: 'Delete an existing Assigned Equipment given the related id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('assignedEquipmentId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { assignedEquipmentId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.assignedEquipmentId);

    reply.status(200).send();
  }
}
