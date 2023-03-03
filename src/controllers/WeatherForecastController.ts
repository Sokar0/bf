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
  subDays,
} from 'date-fns';

import {
  WeatherForecast, WeatherForecastInput,
} from 'cps-common-models/dist/src/entities/WeatherForecast.js';
import { WeatherForecastService } from 'cps-common-models/dist/src/services/WeatherForecastService.js';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Between } from 'typeorm';
import { entityNotFoundResponse, errorResponse, buildPaginationInfo } from './BaseController.js';
import { logger } from '../utils/logger.js';

const Schema = FluentJsonSchema.default;

@Controller('/weatherForecasts')
export class WeatherForecastController {
  constructor(private service: WeatherForecastService) { }

  @GET('/', {
    schema: {
      tags: ['Weather Forecast'],
      description: 'Returns all the Weather Forecasts from the database',
      summary: 'Returns all the Weather Forecasts from the database',
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
  }}>, reply: FastifyReply): Promise<Pagination<WeatherForecast>> {
    const paginationInfo = buildPaginationInfo(reply, request);
    return this.service.get(undefined, paginationInfo);
  }

  @GET(
    '/:weatherForecastId',
    {
      schema: {
        tags: ['Weather Forecast'],
        description: 'Returns the Weather Forecast information based on the id',
        summary: 'Returns the Weather Forecast information based on the id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('weatherForecastId', Schema.string().required()),
      },
    }
  )
  async getById(
    request: FastifyRequest<{ Params: { weatherForecastId: number } }>,
    reply: FastifyReply
  ): Promise<WeatherForecast | null> {
    try {
      const message: WeatherForecast | null = await this.service.getById(request.params.weatherForecastId);
      return !message ? entityNotFoundResponse(reply, request) : message;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @GET(
    '/:siteId/:timestamp',
    {
      schema: {
        tags: ['Weather Forecast'],
        description: 'Returns the Weather Forecast information based on the id',
        summary: 'Returns the Weather Forecast information based on the id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('siteId', Schema.string().required())
          .prop('timestamp', Schema.string().format(Schema.FORMATS.DATE).required().description('Must be passed in the format "yyyy-MM-dd". e.g "2022-11-10"')),
      },
    }
  )
  async getBySiteIdAndTimestamp(
    request: FastifyRequest<{ Params: { siteId: number, timestamp: string } }>,
    reply: FastifyReply
  ): Promise<WeatherForecast[] | null> {
    try {
      const { items } = await this.service.get({
        where: {
          site: {
            siteId: request.params.siteId,
          },
          timestamp: Between(
            new Date(request.params.timestamp),
            new Date(new Date(request.params.timestamp).getTime() + 86399999)
          ),
        },
        select: {
          weatherForecastId: true,
          site: {
            siteId: true,
          },
          timestamp: true,
        },
        order: {
          timestamp: 'ASC',
        },
      });

      if (items.length === 0) {
        return null;
      }

      return items;
    } catch (error) {
      return errorResponse(reply, request);
    }
  }

  @POST(
    '/',
    {
      schema: {
        tags: ['Weather Forecast'],
        description: 'Creates a new Weather Forecast based on the given payload',
        summary: 'Creates a new Weather Forecast based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async create(request: FastifyRequest<{ Body: WeatherForecastInput }>): Promise<WeatherForecast> {
    return this.service.createOrUpdate(request.body);
  }

  @PUT(
    '/',
    {
      schema: {
        tags: ['Weather Forecast'],
        description: 'Update an existing Weather Forecast based on the given payload',
        summary: 'Update an existing Weather Forecast based on the given payload',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        body: Schema.object()
          .prop('to de defined', Schema.string()),
      },
    }
  )
  async update(request: FastifyRequest<{ Body: WeatherForecast }>): Promise<WeatherForecast> {
    return this.service.createOrUpdate(request.body);
  }

  @DELETE(
    '/:weatherForecastId',
    {
      schema: {
        tags: ['Weather Forecast'],
        description: 'Delete an existing Weather Forecast given the related id',
        summary: 'Delete an existing Weather Forecast given the related id',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
        params: Schema.object()
          .prop('weatherForecastId', Schema.number().required()),
      },
    }
  )
  async deleteById(request: FastifyRequest<{ Params: { weatherForecastId: number } }>, reply: FastifyReply): Promise<void> {
    await this.service.deleteBy(request.params.weatherForecastId);

    reply.status(200).send();
  }

  @DELETE(
    '/purgeOldForecasts',
    {
      schema: {
        tags: ['Weather Forecast'],
        description: 'Delete an existing Weather Forecasts that are considered old',
        summary: 'Delete an existing Weather Forecasts that are considered old',
        consumes: ['application/json'],
        produces: ['application/json'],
        headers: Schema.object().prop('Authorization', Schema.string().required()),
      },
    }
  )
  async purgeOldData(): Promise<void> {
    const date = new Date(subDays(new Date(), 1));
    await this.service.deleteAllBeforeDate(date);

    logger.info('Old Weather Forecasts were deleted from database');
  }
}
