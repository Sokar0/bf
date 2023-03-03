/* eslint-disable import/no-unresolved */
/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FastifyReply, FastifyRequest } from 'fastify';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import path from 'path';

import { sendResponse } from '../controllers/BaseController.js';

const AWS_HEADER_DATA = 'x-amzn-oidc-data';
const AWS_HEADER_ID = 'x-amzn-oidc-identity';
const AWS_HEADER_TOKEN = 'x-amzn-oidc-accesstoken';

export const validate = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    if (isPreflightRequest(request) || isSwaggerEndpoint(request)) {
      return;
    }

    if (isAwsRequest(request)) {
      await validateWithAwsToken(request);
    } else {
      validateWithDevToken(request);
    }
  } catch (error) {
    sendResponse('Invalid Token', 401, reply, request);
  }
};

const getHeader = (
  request: FastifyRequest,
  header: string
): string | undefined => {
  const value: string | string[] | undefined = request
    .headers[header];

  return !value || Array.isArray(value)
    ? undefined
    : value;
};

const isAwsRequest = (request: FastifyRequest): boolean => request.headers[AWS_HEADER_DATA] !== undefined
  && request.headers[AWS_HEADER_ID] !== undefined
  && request.headers[AWS_HEADER_TOKEN] !== undefined;

const isPreflightRequest = (request: FastifyRequest): boolean => request.method === 'OPTIONS';
const isSwaggerEndpoint = (request: FastifyRequest): boolean => request.url.startsWith('/docs');

const validateWithAwsToken = async (request: FastifyRequest): Promise<void> => {
  const token: string | undefined = getHeader(request, AWS_HEADER_TOKEN);

  if (!token) {
    throw new Error('Invalid Token');
  }

  await verifier.verify(token);
};

const validateWithDevToken = (request: FastifyRequest): void => {
  const token: string = request
    .headers
    .authorization!
    .split(' ')[1];

  jwt.verify(
    token,
    fs.readFileSync(`${path.resolve()}/public.key`),
    { algorithms: ['ES256'] }
  );
};

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USERPOOLID || '',
  tokenUse: 'access',
  clientId: process.env.CLIENTID || '',
});
