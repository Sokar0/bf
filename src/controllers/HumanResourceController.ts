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
import * as order from 'typeorm/find-options/FindOptionsOrder';

import { Hub } from 'cps-common-models/dist/src/entities/Hub.js';
import {
  HumanResource, HumanResourceInput,
} from 'cps-common-models/dist/src/entities/HumanResource.js';
import { Team } from 'cps-common-models/dist/src/entities/Team.js';
import { HumanResourceService } from 'cps-common-models/dist/src/services/HumanResourceService.js';
import { Pagination } from 'nestjs-typeorm-paginate';
import {
  FindOptionsWhere, IsNull, Not,
} from 'typeorm';
import {
  buildPaginationInfo,
  entityNotFoundResponse,
  errorResponse,
  getWhereShift,
} from './BaseController.js';

const Schema = FluentJsonSchema.default;

const SORT_FIELDS = {
  firstName: 'First name',
  lastName: 'Last name',
  active: 'Active',
  available: 'Available',
};

const SORT_TYPE = {
  ASC: 'ASC',
  DESC: 'DESC',
};

function buildSortingConfig(field?: string, direction?: string): order.FindOptionsOrder<HumanResource> {
  const sortType: order.FindOptionsOrderValue = {
    direction: (direction && direction === 'DESC') ? 'DESC' : 'ASC',
  };

  let sortField: order.FindOptionsOrder<HumanResource>;

  switch (field) {
    case SORT_FIELDS.firstName:
      sortField = { firstName: sortType };
      break;
    case SORT_FIELDS.active:
      sortField = { active: sortType };
      break;
    case SORT_FIELDS.available:
      sortField = { available: sortType };
      break;
    default:
      sortField = { lastName: sortType };
  }

  return sortField;
}

@Controller('/humanResources')
export class HumanResourceController {
  constructor(private service: HumanResourceService) { }

  @GET('/', {
    schema: {
      tags: ['Human Resource'],
      description: 'Returns all the Human Resources from the database',
      summary: 'Returns all the Human Resources from the database',
      consumes: ['application/json'],
      produces: ['application/json'],
      headers: Schema.object().prop('Authorization', Schema.string().required()),
      querystring: Schema.object()
        .prop('hasTeam', Schema.boolean().description('Get human resources that are linked or not to a team'))
        .prop('hubId', Schema.number().description('Get human resources filtered by hubId'))
        .prop('shiftDates', Schema.string().description('Get human resources filtered by shift dates'))
        .prop('showTeam', Schema.boolean().default(false).description('Allow the Team related to the Human Resource to be presented along with the request [Default: false]'))
        .prop('showJobPositions', Schema.boolean().default(false).description('Allow the Job Positions related to the Human Resource to be presented along with the request [Default: false]'))
        .prop('showJobQualifications', Schema.boolean().default(false).description('Allow the Job Qualifications related to the Human Resource to be presented along with the request [Default: false]'))
        .prop('showOperations', Schema.boolean().default(false).description('Allow the Operations related to the Human Resource to be presented along with the request [Default: false]'))
        .prop('showShifts', Schema.boolean().default(false).description('Allow the Shifts related to the Human Resource to be presented along with the request [Default: false]'))
        .prop('showUnavailabilities', Schema.boolean().default(false).description('Allow the Unavailabilities related to the Human Resource to be presented along with the request [Default: false]'))
        .prop('teamId', Schema.number().description('Get human resources filtered by teamId'))
        .prop('page', Schema.number().description('Indicates the page to be shown [Default: 1]'))
        .prop('limit', Schema.number().description('Indicates the limit of records to be shown in a page [Default: 100]'))
        .prop('sortField', Schema.enum(Object.values(SORT_FIELDS)).description('Indicates the field used for sorting the data fetched [Default: Team name]').default(SORT_FIELDS.lastName))
        .prop('sortType', Schema.enum(Object.values(SORT_TYPE)).description('Indicates the sorting direction used for sorting the field [Default: ASC]').default(SORT_TYPE.ASC)),
    },
  })
  get(request: FastifyRequest<{Querystring: {
    hasTeam?: boolean,
    hubId?: number,
    shiftDates?: Date[],
    showTeam?: boolean,
    showJobPositions?: boolean,
    showJobQualifications?: boolean,
    showOperations?: boolean,
    showShifts?: boolean,
    showUnavailabilities?: boolean,
    teamId?: number,
    page?: number,
    limit?: number,
    sortField?: string,
    sortType?: string,
  }}>, reply: FastifyReply): Promise<Pagination<HumanResource>> {
    const relations: string[] = [];
    const where: FindOptionsWhere<HumanResource> = {};

    if (request.query.showJobPositions) {
      relations.push('jobPositions');
    } if (request.query.showJobQualifications) {
      relations.push('jobQualifications');
    } if (request.query.showOperations) {
      relations.push('assignedOperations');
    } if (request.query.showUnavailabilities) {
      relations.push('unavailability');
    }

    if (request.query.showShifts || request.query.shiftDates) {
      relations.push('shifts');

      if (request.query.shiftDates) {
        where.shifts = getWhereShift(request.query.shiftDates);
      }
    }

    if (request.query.showTeam || request.query.teamId) {
      relations.push('team');

      if (request.query.teamId) {
        const whereTeam: FindOptionsWhere<Team> = {};
        whereTeam.teamId = request.query.teamId;

        where.team = whereTeam;
      }
    }

    if (request.query.hasTeam !== undefined) {
      if (request.query.hasTeam) {
        where.team = Not(IsNull());
      } else {
        where.team = IsNull();
      }
    }

    if (request.query.hubId) {
      const whereHub: FindOptionsWhere<Hub> = {};
      whereHub.hubId = request.query.hubId;

      where.hub = whereHub;
    }

    return this.service.get({
      order: buildSortingConfig(request.query.sortField, request.query.sortType),
      relations,
      where,
    }, buildPaginationInfo(reply, request));
  }

  @GET(
    '/:humanResourceId',
    {
      schema: {
        tags: ['Human Resource'],
        description: 'Returns the Human Resource information based on the id',
        summary: 'Returns the Human Resource information based on the id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('humanResourceId', Schema.string().required()),
      },
    }
  )
  async getById(
    request: FastifyRequest<{ Params: { humanResourceId: number } }>,
    reply: FastifyReply
  ): Promise<HumanResource | null> {
    try {
      const message: HumanResource | null = await this.service.getById(request.params.humanResourceId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Human Resource'],
        description: 'Creates a new Human Resource based on the given payload',
        summary: 'Creates a new Human Resource based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: HumanResourceInput }>): Promise<HumanResource> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Human Resource'],
        description: 'Update an existing Human Resource based on the given payload',
        summary: 'Update an existing Human Resource based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: HumanResource }>): Promise<HumanResource> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:humanResourceId',
    {
      schema: {
        tags: ['Human Resource'],
        description: 'Delete an existing Human Resource given the related id',
        summary: 'Delete an existing Human Resource given the related id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('humanResourceId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { humanResourceId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.humanResourceId);

    reply.status(200).send();
  }
}
