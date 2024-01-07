import * as express from 'express';

import { NotAcceptableError, NotImplementedError } from '@benassa-de-glassa/http';
import { Logger } from '@benassa-de-glassa/logger';
import { Observable } from 'rxjs';
import { ExpressHandler } from './express-handler';
import { AuthenticationEnrichment } from './middleware/authentication-middleware-factory';
import { LoggerEnrichment } from './middleware/logger-middleware-factory';
import { Endpoint, EndpointResponse, HttpHandler, MimeType, ResponseType } from '../model/handlers';
import {
  EventStreamResponseHandler,
  FileResponseHandler,
  HTMLResponseHandler,
  JSONResponseHandler,
  ResponseHandler,
  TextResponseHandler,
  XMLResponseHandler
} from '../response-handlers';

export class ExpressHttpAdapter {
  public expressHandler(
    endpoint: Endpoint,
    pathEndpoints: {
      POST?: Endpoint;
      GET?: Endpoint;
      PATCH?: Endpoint;
      PUT?: Endpoint;
      DELETE?: Endpoint;
    }
  ): ExpressHandler {
    return async (
      request: express.Request & Partial<AuthenticationEnrichment> & Partial<LoggerEnrichment>,
      response: express.Response,
      next: express.NextFunction
    ) => {
      const responseType = this.acceptableResponseType(
        endpoint.responseTypes,
        request.headers.accept as MimeType | null
      );

      const handler: ResponseHandler = this.handler(responseType, response, next, request.logger!);

      const response$ = this.response$(endpoint.handler, pathEndpoints, request);

      await handler.handle(response$);
    };
  }

  private handler(
    responseType: MimeType | ResponseType,
    response: express.Response<any, Record<string, any>>,
    next: express.NextFunction,
    logger: Logger
  ) {
    let handler: ResponseHandler;
    switch (responseType) {
      case ResponseType.file:
        handler = new FileResponseHandler(response, next);
        break;
      case MimeType.eventStream:
        handler = new EventStreamResponseHandler(response, next);
        break;
      case MimeType.html:
        handler = new HTMLResponseHandler(response, next);
        break;
      case MimeType.xml:
        handler = new XMLResponseHandler(response, next);
        break;
      case MimeType.text:
        handler = new TextResponseHandler(response, next);
        break;
      case MimeType.csv:
        throw new NotImplementedError('Not Implemented');

      case null:
      case undefined:
      case MimeType.json:
      default:
        handler = new JSONResponseHandler(response, next);
        break;
    }
    return handler;
  }

  private response$(
    handler: HttpHandler,
    pathEndpoints: {
      POST?: Endpoint;
      GET?: Endpoint;
      PATCH?: Endpoint;
      PUT?: Endpoint;
      DELETE?: Endpoint;
    },
    request: express.Request & Partial<AuthenticationEnrichment> & Partial<LoggerEnrichment>
  ): Observable<EndpointResponse> {
    return handler.call(
      pathEndpoints,
      {
        body: request.body,
        lowercaseHeaders: request.headers,
        urlParameters: request.params,
        queryParameters: request.query as Record<string, string>
      },
      request.token ?? {},
      request.logger!
    );
  }

  private acceptableResponseType(
    endpointTypes: Set<unknown>,
    acceptHeader: MimeType | null
  ): MimeType | ResponseType.file {
    const acceptsAny = acceptHeader == null || acceptHeader.includes('*/*');

    if (endpointTypes.has(ResponseType.file)) {
      // files mimetypes get automatically handled by express
      return ResponseType.file;
    }

    if (endpointTypes.has(ResponseType.text)) {
      if (acceptsAny || acceptHeader.includes(MimeType.text)) {
        return MimeType.text;
      }
    }

    if (endpointTypes.has(ResponseType.eventStream)) {
      if (acceptsAny || acceptHeader.includes(MimeType.eventStream)) {
        return MimeType.eventStream;
      }
    }

    if (endpointTypes.has(ResponseType.html)) {
      if (acceptsAny || acceptHeader.includes(MimeType.html)) {
        return MimeType.html;
      }
    }

    if (endpointTypes.has(ResponseType.csv)) {
      throw new NotImplementedError('Not Implemented');
    }

    if (endpointTypes.has(ResponseType.object)) {
      if (acceptsAny || acceptHeader.includes(MimeType.json)) {
        return MimeType.json;
      }
      if (acceptsAny || acceptHeader.includes(MimeType.xml)) {
        return MimeType.xml;
      }
    }
    if (acceptsAny) {
      return MimeType.json;
    }

    throw new NotAcceptableError('Not Acceptable', { header: acceptHeader, acceptableTypes: endpointTypes });
  }
}
