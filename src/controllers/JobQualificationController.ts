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
  JobQualification, JobQualificationInput,
} from 'cps-common-models/dist/src/entities/JobQualification.js';
import { JobQualificationService } from 'cps-common-models/dist/src/services/JobQualificationService.js';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/jobQualifications')
export class JobQualificationController {
  constructor(private service: JobQualificationService) { }

  @GET('/', {
    schema: {
      tags: ['Job Qualification'],
      description: 'Returns all the Job Qualifications from the database',
      summary: 'Returns all the Job Qualifications from the database',
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
  }}>, reply: FastifyReply): Promise<Pagination<JobQualification>> {
    const paginationInfo = buildPaginationInfo(reply, request);
    return this.service.get(undefined, paginationInfo);
  }

  @GET(
    '/:jobQualificationId',
    {
      schema: {
        tags: ['Job Qualification'],
        description: 'Returns the Job Qualification information based on the id',
        summary: 'Returns the Job Qualification information based on the id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('jobQualificationId', Schema.string().required()),
      },
    }
  )
  async getById(
    request: FastifyRequest<{ Params: { jobQualificationId: number } }>,
    reply: FastifyReply
  ): Promise<JobQualification | null> {
    try {
      const message: JobQualification | null = await this.service.getById(request.params.jobQualificationId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Job Qualification'],
        description: 'Creates a new Job Qualification based on the given payload',
        summary: 'Creates a new Job Qualification based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: JobQualificationInput }>): Promise<JobQualification> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Job Qualification'],
        description: 'Update an existing Job Qualification based on the given payload',
        summary: 'Update an existing Job Qualification based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: JobQualification }>): Promise<JobQualification> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:jobQualificationId',
    {
      schema: {
        tags: ['Job Qualification'],
        description: 'Delete an existing Job Qualification given the related id',
        summary: 'Delete an existing Job Qualification given the related id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('jobQualificationId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { jobQualificationId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.jobQualificationId);

    reply.status(200).send();
  }
}
