import urlJoin = require('url-join');

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { LabelableLogger } from '@benassa-de-glassa/logger';
import { UUIDv4IdGenerator } from '@benassa-de-glassa/utilities';

import { handleAuthenticationError } from '../express-common/error-handlers/express-authentication-error-handler';
import { handleAuthorizationError } from '../express-common/error-handlers/express-authorization-error-handler';
import { handleInternalServerError } from '../express-common/error-handlers/express-internal-error-handler';
import { handleInvalidRequestError } from '../express-common/error-handlers/express-invalid-request-error-handler';
import { handleNotAcceptableError } from '../express-common/error-handlers/express-not-acceptable-error-handler';
import { handleNotFoundError } from '../express-common/error-handlers/express-not-found-error-handler';
import { handleNotImplementedError } from '../express-common/error-handlers/express-not-implemented-error-handler';
import { handleUnknownError } from '../express-common/error-handlers/express-unknown-error-handler';
import { handleValidationError } from '../express-common/error-handlers/express-validation-error-handler';
import { ExpressHandler } from '../express-common/express-handler';
import { HttpEndpoints, HttpRoute, ExpressHttpRouterFactory } from './express-http-router-factory';
import { auditLoggingMiddleware } from '../express-common/middleware/audit-logging-middleware';
import { CorrelationIdMiddlewareFactory } from '../express-common/middleware/correlation-id-middleware-factory';
import { LoggerMiddlewareFactory } from '../express-common/middleware/logger-middleware-factory';

interface EndpointCollection {
  [path: string]: { endpoints: HttpEndpoints[]; middleware: ExpressHandler[] };
}

export class ExpressHttpAppBuilder {
  private readonly endpoints: EndpointCollection = {};
  private readonly routerFactory = new ExpressHttpRouterFactory();

  private readonly errorHandlers: ((
    error: Error,
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => Promise<void>)[] = [];

  private readonly loggingMiddlewareFactory: LoggerMiddlewareFactory;
  private readonly correlationIdMiddlewareFactory = new CorrelationIdMiddlewareFactory(
    new UUIDv4IdGenerator(),
    'x-correlation-id'
  );

  public constructor(logger: LabelableLogger) {
    this.loggingMiddlewareFactory = new LoggerMiddlewareFactory(logger);
  }

  public build(): express.Application {
    const app = this.createApp();

    this.setupHealthRoute(app);
    this.setupContentRoutes(app);
    this.setupFallbackRoute(app);
    this.setupErrorHandlers(app);

    return app;
  }

  public withErrorHandlers(
    handler: (
      error: Error,
      request: express.Request,
      response: express.Response,
      next: express.NextFunction
    ) => Promise<void>
  ): ExpressHttpAppBuilder {
    this.errorHandlers.push(handler);
    return this;
  }

  public withEndpoint(path: string, endpoints: HttpEndpoints, middleware: ExpressHandler[]): ExpressHttpAppBuilder {
    this.validatePath(path);
    if (this.endpoints[path] == null) {
      this.endpoints[path] = { endpoints: [], middleware: [] };
    }
    this.endpoints[path].endpoints.push(endpoints);
    this.endpoints[path].middleware.push(...middleware);

    return this;
  }

  private setupContentRoutes(app: express.Application): void {
    Object.entries(this.endpoints).forEach(([route, { endpoints, middleware }]) => {
      this.setupRoute(app, {
        root: urlJoin('/', route),
        endpoints,
        middleware
      });
    });
  }

  private setupHealthRoute(app: express.Application): void {
    app.get('/health', (_request: express.Request, response: express.Response) => {
      response.sendStatus(200);
    });
  }

  private setupFallbackRoute(app: express.Application): void {
    app.all('*', (_request: express.Request, response: express.Response) => {
      response.sendStatus(404);
    });
  }

  private createApp(): express.Application {
    const app = express();
    app.enable('trust proxy');
    app.use(this.loggingMiddlewareFactory.get());
    app.use(this.correlationIdMiddlewareFactory.get());
    app.use(auditLoggingMiddleware);
    app.use(cors({ origin: true }));
    app.use(helmet());
    app.use(cookieParser());
    app.use(express.json());
    return app;
  }

  private setupRoute(app: express.Application, route: HttpRoute): void {
    const router = this.routerFactory.getFor(route);

    app.use(route.root, router);
  }

  private setupErrorHandlers(app: express.Application): void {
    app.use(handleAuthenticationError);
    app.use(handleAuthorizationError);
    app.use(handleNotFoundError);
    app.use(handleNotAcceptableError);
    app.use(handleInvalidRequestError);
    app.use(handleValidationError);
    app.use(handleNotImplementedError);
    app.use(handleInternalServerError);
    this.errorHandlers.forEach(handler => app.use(handler));
    app.use(handleUnknownError);
  }

  private validatePath(path: string): void {
    if (path.length > 0 && path[0] !== '/') {
      throw new Error('Endpoints have to start with a dash');
    }
  }
}
