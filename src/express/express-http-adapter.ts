import * as express from 'express';

import { EndpointResponse, HttpHandler } from './model/handlers';
import { ExpressHandler } from './express-handler';
import { LoggerEnrichment } from './middleware/logger-middleware-factory';
import { AuthenticationEnrichment } from './middleware/authentication-middleware-factory';
import { Observable, catchError, firstValueFrom, of, tap } from 'rxjs';

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
      if (request.headers.accept === 'text/event-stream') {
        this.handleEventStreamRequest(handler, pathEndpoints, request, response, next);
      } else {
        await this.handleSingleRequest(handler, pathEndpoints, request, response, next);
      }
    };
  }

  private handleEventStreamRequest(
    handler: HttpHandler,
    pathEndpoints: {
      postHandler?: HttpHandler;
      getHandler?: HttpHandler;
      patchHandler?: HttpHandler;
      putHandler?: HttpHandler;
      deleteHandler?: HttpHandler;
    },
    request: express.Request & Partial<AuthenticationEnrichment> & Partial<LoggerEnrichment>,
    response: express.Response,
    next: express.NextFunction
  ) {
    if (request.logger == null) {
      throw new Error('Middleware setup incorrectly');
    }
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Connection', 'keep-alive');
    response.flushHeaders(); // flush the headers to establish SSE with client

    const response$: Observable<EndpointResponse> = handler.call(
      pathEndpoints,
      {
        body: request.body,
        lowercaseHeaders: request.headers,
        urlParameters: request.params,
        queryParameters: request.query as Record<string, string>
      },
      request.token ?? {},
      request.logger
    );

    const subscription = response$
      .pipe(
        tap(handlerResponse => {
          if (handlerResponse.payload.id != null) {
            response.write(`id: ${handlerResponse.payload.id}\n`);
          }
          response.write(`event: message\n`);
          response.write(`data: ${JSON.stringify(handlerResponse.payload)}\n\n`);
        }),
        catchError(error => {
          subscription.unsubscribe();
          return of(next(error));
        })
      )
      .subscribe();

    response.on('finish', () => {
      subscription.unsubscribe();
    });
  }

  private async handleSingleRequest(
    handler: HttpHandler,
    pathEndpoints: {
      postHandler?: HttpHandler;
      getHandler?: HttpHandler;
      patchHandler?: HttpHandler;
      putHandler?: HttpHandler;
      deleteHandler?: HttpHandler;
    },
    request: express.Request & Partial<AuthenticationEnrichment> & Partial<LoggerEnrichment>,
    response: express.Response,
    next: express.NextFunction
  ) {
    if (request.logger == null) {
      throw new Error('Middleware setup incorrectly');
    }
    let payload: any;
    let code: number;
    try {
      const response$: Observable<EndpointResponse> = handler.call(
        pathEndpoints,
        {
          body: request.body,
          lowercaseHeaders: request.headers,
          urlParameters: request.params,
          queryParameters: request.query as Record<string, string>
        },
        request.token ?? {},
        request.logger
      );

      ({ payload, code } = await firstValueFrom(response$));
    } catch (error) {
      next(error);
      return;
    }
    response.status(code).json(payload);
  }
}
