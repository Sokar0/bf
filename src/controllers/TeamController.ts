/* eslint-disable import/no-unresolved */
/* eslint-disable no-useless-constructor */
/* eslint-disable import/extensions */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  FastifyReply, FastifyRequest,
} from 'fastify';
import {
  Controller, DELETE, GET, POST, PUT,
} from 'fastify-decorators';
import * as FluentJsonSchema from 'fluent-json-schema';
import * as order from 'typeorm/find-options/FindOptionsOrder';

import { Country } from 'cps-common-models/dist/src/entities/Country.js';
import { HumanResource } from 'cps-common-models/dist/src/entities/HumanResource.js';
import {
  Team, TeamInput,
} from 'cps-common-models/dist/src/entities/Team.js';
import { TeamService } from 'cps-common-models/dist/src/services/TeamService.js';
import { Pagination } from 'nestjs-typeorm-paginate';
import { FindOptionsWhere, LessThan, MoreThan } from 'typeorm';
import { Hub } from 'cps-common-models/dist/src/entities/Hub.js';
import {
  buildPaginationInfo, entityNotFoundResponse, errorResponse, getWhereShift,
} from './BaseController.js';

const Schema = FluentJsonSchema.default;

const SORT_FIELDS = {
  teamName: 'Team name',
  startDate: 'Start date',
  active: 'Active',
  available: 'Available',
};

const SORT_TYPE = {
  ASC: 'ASC',
  DESC: 'DESC',
};

function buildSortingConfig(field?: string, direction?: string): order.FindOptionsOrder<Team> {
  const sortType: order.FindOptionsOrderValue = {
    direction: (direction && direction === 'DESC') ? 'DESC' : 'ASC',
  };

  let sortField: order.FindOptionsOrder<Team>;

  switch (field) {
    case SORT_FIELDS.startDate:
      sortField = { startDate: sortType };
      break;
    case SORT_FIELDS.active:
      sortField = { active: sortType };
      break;
    case SORT_FIELDS.available:
      sortField = { available: sortType };
      break;
    default:
      sortField = { teamName: sortType };
  }

  return sortField;
}

@Controller('/teams')
export class TeamController {
  constructor(private service: TeamService) { }

  @GET('/', {
    schema: {
      tags: ['Team'],
      description: 'Returns all the Teams from the database',
      summary: 'Returns all the Teams from the database',
      consumes: ['application/json'],
      produces: ['application/json'],
      headers: Schema.object().prop('Authorization', Schema.string().required()),
      querystring: Schema.object()
        .prop('countryId', Schema.number().description('Get teams filtered by countryId'))
        .prop('date', Schema.string().description('Get teams filtered by date'))
        .prop('hubId', Schema.number().description('Get teams filtered by hubId'))
        .prop('shiftDates', Schema.string().description('Get teams filtered by shift dates'))
        .prop('showHumanResources', Schema.boolean().default(false).description('Allow the Human Resources related to the Team to be presented along with the request [Default: false]'))
        .prop('showOperations', Schema.boolean().default(false).description('Allow the Operations related to the Team to be presented along with the request [Default: false]'))
        .prop('showShifts', Schema.boolean().default(false).description('Allow the Shifts related to the Team to be presented along with the request [Default: false]'))
        .prop('page', Schema.number().description('Indicates the page to be shown [Default: 1]'))
        .prop('limit', Schema.number().description('Indicates the limit of records to be shown in a page [Default: 100]'))
        .prop('sortField', Schema.enum(Object.values(SORT_FIELDS)).description('Indicates the field used for sorting the data fetched [Default: Team name]').default(SORT_FIELDS.teamName))
        .prop('sortType', Schema.enum(Object.values(SORT_TYPE)).description('Indicates the sorting direction used for sorting the field [Default: ASC]').default(SORT_TYPE.ASC)),
    },
  })
  get(request: FastifyRequest<{Querystring: {
    countryId?: number,
    date?: Date,
    hubId?: number,
    shiftDates?: Date[],
    showHumanResources?: boolean,
    showHub?: boolean,
    showOperations?: boolean,
    showShifts?: boolean,
    page?: number,
    limit?: number,
    sortField?: string,
    sortType?: string,
  }}>, reply: FastifyReply): Promise<Pagination<Team>> {
    const relations: string[] = [];
    const sorting: order.FindOptionsOrder<Team> = buildSortingConfig(request.query.sortField, request.query.sortType);
    const where: FindOptionsWhere<Team> = {};

    if (request.query.showHumanResources) {
      const sortingHumanResource: order.FindOptionsOrder<HumanResource> = { lastName: 'ASC' };
      sorting.humanResources = sortingHumanResource;

      relations.push('humanResources');
    } if (request.query.showOperations) {
      relations.push('assignedOperations');
    }

    if (request.query.showShifts || request.query.shiftDates) {
      relations.push('humanResources.shifts');

      if (request.query.shiftDates) {
        where.humanResources = {
          shifts: getWhereShift(request.query.shiftDates),
        };
      }
    }

    if (request.query.countryId) {
      const whereCountry: FindOptionsWhere<Country> = {};
      whereCountry.countryId = request.query.countryId;

      const whereHub: FindOptionsWhere<Hub> = {};
      whereHub.country = whereCountry;

      where.hub = whereHub;
    }

    if (request.query.date) {
      where.endDate! = MoreThan(request.query.date);
      where.startDate! = LessThan(request.query.date);
    }

    if (request.query.hubId) {
      const whereHub: FindOptionsWhere<Hub> = {};
      whereHub.hubId = request.query.hubId;

      where.hub = whereHub;
    }

    return this.service.get({
      order: sorting,
      where,
      relations,
    }, buildPaginationInfo(reply, request));
  }

  @GET(
    '/:team_id',
    {
      schema: {
        tags: ['Team'],
        description: 'Returns the Team information based on the id',
        summary: 'Returns the Team information based on the id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('team_id', Schema.string().required()),
      },
    }
  )
  async getById(
    request: FastifyRequest<{ Params: { team_id: number } }>,
    reply: FastifyReply
  ): Promise<Team | null> {
    try {
      const message: Team | null = await this.service.getById(request.params.team_id);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Team'],
        description: 'Creates a new Team based on the given payload',
        summary: 'Creates a new Team based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: TeamInput }>): Promise<Team> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Team'],
        description: 'Update an existing Team based on the given payload',
        summary: 'Update an existing Team based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: Team }>): Promise<Team> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:team_id',
    {
      schema: {
        tags: ['Team'],
        description: 'Delete an existing Team given the related id',
        summary: 'Delete an existing Team given the related id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('team_id', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { team_id: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.team_id);

    reply.status(200).send();
  }
}
