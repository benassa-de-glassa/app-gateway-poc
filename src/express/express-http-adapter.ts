import * as express from 'express';

import { IdGenerator } from '@benassa-de-glassa/node-utilities/dist/utilities/id-generators/id-generator.model.js';
import { UUIDv4IdGenerator } from '@benassa-de-glassa/node-utilities/dist/utilities/id-generators/uuid-v4-id-generator.js';

import { HttpHandler } from '../model/handlers.js';
import { ExpressHandler } from './express-handler.js';

export class ExpressHttpAdapter {
  private readonly correlationIdGenerator: IdGenerator = new UUIDv4IdGenerator();

  public constructor(private readonly correlationIdHeader: string) {}
  public expressHandler(
    handler: HttpHandler,
    pathEndpoints: {
      postHandler?: HttpHandler;
      getHandler?: HttpHandler;
      patchHandler?: HttpHandler;
      putHandler?: HttpHandler;
      deleteHandler?: HttpHandler;
    }
  ): ExpressHandler {
    return async (request: express.Request, response: express.Response, next: express.NextFunction) => {
      let payload: any;
      let code: number;
      try {
        ({ payload, code } = await handler.call(pathEndpoints, {
          body: request.body,
          lowercaseHeaders: request.headers,
          urlParameters: request.params,
          queryParameters: request.query,
          corrlationId: request.headers[this.correlationIdHeader] ?? this.correlationIdGenerator.generatedId()
        }));
      } catch (error) {
        next(error);
        return;
      }
      response.status(code).json(payload);
    };
  }
}
