import * as express from 'express';

import { HttpHandler } from './model/handlers';
import { ExpressHandler } from './express-handler';
import { LoggerEnrichment } from './middleware/logger-middleware-factory';
import { AuthenticationEnrichment } from './middleware/authentication-middleware-factory';

export class ExpressHttpAdapter {
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
    return async (
      request: express.Request & Partial<AuthenticationEnrichment> & Partial<LoggerEnrichment>,
      response: express.Response,
      next: express.NextFunction
    ) => {
      if (request.token == null || request.logger == null) {
        throw new Error('Middleware setup incorrectly');
      }

      let payload: any;
      let code: number;
      try {
        ({ payload, code } = await handler.call(
          pathEndpoints,
          {
            body: request.body,
            lowercaseHeaders: request.headers,
            urlParameters: request.params,
            queryParameters: request.query
          },
          request.token,
          request.logger
        ));
      } catch (error) {
        next(error);
        return;
      }
      response.status(code).json(payload);
    };
  }
}
