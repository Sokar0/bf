/* eslint-disable no-useless-constructor */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  Controller, DELETE, GET, POST, PUT,
} from 'fastify-decorators';
import * as FluentJsonSchema from 'fluent-json-schema';

import { User, UserInput } from 'cps-common-models/dist/src/entities/User.js';
import { UserService } from 'cps-common-models/dist/src/services/UserService.js';
import { Pagination } from 'nestjs-typeorm-paginate';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';

const Schema = FluentJsonSchema.default;

@Controller('/users')
export class UserController {
  constructor(private service: UserService) { }

  @GET('/', {
    schema: {
      tags: ['User'],
      description: 'Returns all the Users from the database',
      summary: 'Returns all the Users from the database',
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
  }}>, reply: FastifyReply): Promise<Pagination<User>> {
    const paginationInfo = buildPaginationInfo(reply, request);
    return this.service.get(undefined, paginationInfo);
  }

  @GET(
    '/:userId',
    {
      schema: {
        tags: ['User'],
        description: 'Returns the User information based on the userId',
        summary: 'Returns the User information based on the userId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('userId', Schema.number().required()),
      },
    }
  )
  async getById(request: FastifyRequest<{ Params: { userId: number } }>, reply: FastifyReply): Promise<User | null> {
    try {
      const message: User | null = await this.service.getById(request.params.userId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['User'],
        description: 'Creates a new User based on the given payload',
        summary: 'Creates a new User based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: UserInput }>): Promise<User> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['User'],
        description: 'Update an existing User based on the given payload',
        summary: 'Update an existing User based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: User }>): Promise<User> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:userId',
    {
      schema: {
        tags: ['User'],
        description: 'Delete an existing User given the related userId',
        summary: 'Delete an existing User given the related userId',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('userId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { userId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.userId);

    reply.status(200).send();
  }
}
