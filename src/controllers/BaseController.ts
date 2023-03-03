/* eslint-disable no-use-before-define */
import { FastifyReply, FastifyRequest } from 'fastify';
import { FindOptionsWhere, In } from 'typeorm';

import { FtShift } from 'cps-common-models/dist/src/entities/FtShift';

export const buildPaginationInfo = (
  reply: FastifyReply,
  request: FastifyRequest<{Querystring: { page?: number, limit?: number }}>
) => ({
  page: request.query.page ? request.query.page : 1,
  limit: !request.query.limit || request.query.limit > 100 ? 100 : request.query.limit,
  route: `${request.protocol}://${request.hostname}${reply.server.prefix}`,
});

export const entityNotFoundResponse = (
  reply: FastifyReply,
  request: FastifyRequest
) => sendResponse('Entity not found', 404, reply, request);

export const errorResponse = (
  reply: FastifyReply,
  request: FastifyRequest
) => sendResponse(null, 500, reply, request);

export const getWhereShift = (dates: Date[]) => {
  const aux: Date[] = typeof dates === 'string' || dates instanceof String
    ? Array(1).fill(dates)
    : dates;

  const whereShift: FindOptionsWhere<FtShift> = {};
  whereShift.date = In(aux);

  return whereShift;
};

export const sendResponse = (
  message: string | null,
  statusCode: number,
  reply: FastifyReply,
  request: FastifyRequest
) => {
  const body = {
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: request.url,
  };

  reply.status(statusCode).send(body);

  return null;
};
