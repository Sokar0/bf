# FROM node:lts-slim as builder
FROM public.ecr.aws/x3d6i2k7/alpine:3.15 as builder

ENV NODE_VERSION 16.17.0

LABEL version="1.0.0"
LABEL description="CPS/MS_Template Docker Image"
LABEL maintainer="Ornelio Hinterholz Junior <ornelio.hinterholz@bentley.com>"

RUN apk add --update nodejs npm openssh-client bash git

WORKDIR /app

# set default node env
ARG NODE_ENV=local
ARG HTTP_PORT=80
ARG HTTPS_PORT=443
ARG ALLOWED_ORIGINS=['*']
ARG USERPOOLID=en-central-1
ARG CLIENTID=012435

# ARG NODE_ENV=production
# to be able to run tests (for example in CI), do not set production as environment
ENV NODE_ENV ${NODE_ENV}
ENV HTTP_PORT ${HTTP_PORT}
ENV HTTPS_PORT ${HTTPS_PORT}
ENV ALLOWED_ORIGINS ${ALLOWED_ORIGINS}
ENV USERPOOLID ${USERPOOLID}
ENV CLIENTID ${CLIENTID}
RUN touch ./env.txt
RUN printenv > ./env.txt
RUN apk add jq
RUN apk add curl
RUN curl -X GET https://cognito-idp.eu-central-1.amazonaws.com/$USERPOOLID/.well-known/jwks.json -o jwks.json
RUN jq . jwks.json

ENV NPM_CONFIG_LOGLEVEL=warn
ARG USER_ID=1000
ARG GROUP_ID=1000

RUN addgroup -g ${GROUP_ID} nodejs && adduser -D nodejs -u ${USER_ID} -g nodejs -G nodejs -s /bin/sh -h /
RUN apk add git openssh-client
COPY package.json ./
RUN --mount=type=ssh,id=github npm install --no-audit
COPY --chown=nodejs:nodejs package*.json ./
RUN npm install --no-audit --loglevel verbose && npm cache clean --force

# copy all sources in the container (exclusions in .dockerignore file)
COPY --chown=nodejs:nodejs . .

EXPOSE 3123
CMD npm run start
