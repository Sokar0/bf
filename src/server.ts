/* eslint-disable import/extensions */
/* eslint-disable import/no-import-module-exports */
/* eslint-disable jest/require-hook */
/* eslint-disable import/no-unresolved */
import 'reflect-metadata';
import 'dotenv/config';

import fastifySwagger from '@fastify/swagger';
import Fastify, { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import { bootstrap } from 'fastify-decorators';

import { AssetController } from './controllers/AssetController.js';
import { AssignedComponentController } from './controllers/AssignedComponentController.js';
import { AssignedEquipmentController } from './controllers/AssignedEquipmentController.js';
import { AssignedOperationsController } from './controllers/AssignedOperationsController.js';
import { AssignedToolController } from './controllers/AssignedToolController.js';
import { CountryController } from './controllers/CountryController.js';
import { EquipmentController } from './controllers/EquipmentController.js';
import { FtShiftController } from './controllers/FtShiftController.js';
import { HubController } from './controllers/HubController.js';
import { HumanResourceController } from './controllers/HumanResourceController.js';
import { JobPositionController } from './controllers/JobPositionController.js';
import { JobQualificationController } from './controllers/JobQualificationController.js';
import { MaterialController } from './controllers/MaterialController.js';
import { MaterialStockController } from './controllers/MaterialStockController.js';
import { OperationController } from './controllers/OperationController.js';
import { RequiredQualificationsController } from './controllers/RequiredQualificationsController.js';
import { ServiceNotificationController } from './controllers/ServiceNotificationController.js';
import { ServiceOrderController } from './controllers/ServiceOrderController.js';
import { SiteController } from './controllers/SiteController.js';
import { TeamController } from './controllers/TeamController.js';
import { ToolController } from './controllers/ToolController.js';
import { UnavailabilityController } from './controllers/UnavailabilityController';
import { UserController } from './controllers/UserController.js';
import { WeatherForecastController } from './controllers/WeatherForecastController.js';
import { WorkCenterController } from './controllers/WorkCenterController.js';
import { WorkScheduleController } from './controllers/WorkScheduleController.js';
import { WorkScheduleHumanResourceController } from './controllers/WorkScheduleHumanResourceController.js';
import { WorkScheduleTimeController } from './controllers/WorkScheduleTimeController.js';
import { validate } from './services/TokenService.js';
import { logger } from './utils/logger.js';

const server: FastifyInstance = Fastify({
  logger: true,
});

async function start() {
  try {
    server.addHook('onRequest', validate);

    server.register(fastifyCors, {
      origin: '*',
    });

    server.register(fastifySwagger, {
      routePrefix: '/docs',
      swagger: {
        info: {
          title: 'CPS/BFF Microservice',
          description: 'Endpoints for BFF (Backend for Frontend) Microservice',
          version: '1.0.0',
        },
        schemes: ['http', 'https'],
        consumes: ['application/json'],
        produces: ['application/json'],
        securityDefinitions: {
          apiKey: {
            type: 'apiKey',
            name: 'apiKey',
            in: 'header',
          },
        },
      },
      exposeRoute: true,
    });

    server.register(bootstrap, {
      controllers: [
        AssetController,
        AssignedComponentController,
        AssignedEquipmentController,
        AssignedOperationsController,
        AssignedToolController,
        CountryController,
        EquipmentController,
        HubController,
        HumanResourceController,
        JobPositionController,
        JobQualificationController,
        MaterialController,
        MaterialStockController,
        OperationController,
        RequiredQualificationsController,
        ServiceNotificationController,
        ServiceOrderController,
        FtShiftController,
        SiteController,
        TeamController,
        ToolController,
        UnavailabilityController,
        UserController,
        WeatherForecastController,
        WorkCenterController,
        WorkScheduleController,
        WorkScheduleHumanResourceController,
        WorkScheduleTimeController,
      ],
    });

    const envPort: number = (process.env.NODE_ENV === 'local' ? Number(process.env.HTTP_PORT) : Number(process.env.HTTPS_PORT));
    const address = await server.listen({
      port: envPort || 3123,
      host: '::',
    });

    logger.info(`Application running and listening at ${address}`);
    logger.info(`Documentation available at ${address}/docs`);
    // logger.info(`Available routes: \n${server.printRoutes()}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
