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
  RequiredQualifications, RequiredQualificationsInput,
} from 'cps-common-models/dist/src/entities/RequiredQualifications.js';
import { RequiredQualificationsService } from 'cps-common-models/dist/src/services/RequiredQualificationsService.js';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/requiredQualifications')
export class RequiredQualificationsController {
  constructor(private service: RequiredQualificationsService) { }

  @GET('/', {
    schema: {
      tags: ['Required Qualifications'],
      description: 'Returns all the Required Qualifications from the database',
      summary: 'Returns all the Required Qualifications from the database',
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
  }}>, reply: FastifyReply): Promise<Pagination<RequiredQualifications>> {
    const paginationInfo = buildPaginationInfo(reply, request);
    return this.service.get(undefined, paginationInfo);
  }

  @GET(
    '/:requiredQualificationsId',
    {
      schema: {
        tags: ['Required Qualifications'],
        description: 'Returns the Required Qualifications information based on the id',
        summary: 'Returns the Required Qualifications information based on the id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('requiredQualificationsId', Schema.string().required()),
      },
    }
  )
  async getById(
    request: FastifyRequest<{ Params: { requiredQualificationsId: number } }>,
    reply: FastifyReply
  ): Promise<RequiredQualifications | null> {
    try {
      const message: RequiredQualifications | null = await this.service.getById(request.params.requiredQualificationsId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Required Qualifications'],
        description: 'Creates a new Required Qualifications based on the given payload',
        summary: 'Creates a new Required Qualifications based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: RequiredQualificationsInput }>): Promise<RequiredQualifications> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Required Qualifications'],
        description: 'Update an existing Required Qualifications based on the given payload',
        summary: 'Update an existing Required Qualifications based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: RequiredQualifications }>): Promise<RequiredQualifications> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:requiredQualificationsId',
    {
      schema: {
        tags: ['Required Qualifications'],
        description: 'Delete an existing Required Qualifications given the related id',
        summary: 'Delete an existing Required Qualifications given the related id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('requiredQualificationsId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { requiredQualificationsId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.requiredQualificationsId);

    reply.status(200).send();
  }
}
