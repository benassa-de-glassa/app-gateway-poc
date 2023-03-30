import { IdGenerator } from '@benassa-de-glassa/node-utilities/dist/utilities/id-generators/id-generator.model.js';
import { UUIDv4IdGenerator } from '@benassa-de-glassa/node-utilities/dist/utilities/id-generators/uuid-v4-id-generator.js';
import * as express from 'express';
import { HttpHandler } from '../model/get-stream-handler.js';

export type ExpressHandler = (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => Promise<void>;

export class ExpressHttpAdapter {
  private readonly correlationIdGenerator: IdGenerator = new UUIDv4IdGenerator();
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
      // if (request.token == null || request.logger == null) {
      //   next(new Error('Middleware setup is faulty. This should not happen.'));
      //   return;
      // }
      let payload;
      let code;
      try {
        ({ payload, code } = await handler.call(pathEndpoints, {
          body: request.body,
          lowercaseHeaders: request.headers,
          urlParameters: request.params,
          queryParameters: request.query
        }));
      } catch (error) {
        next(error);
        return;
      }
      response.status(code).json(payload);
    };
  }
}
