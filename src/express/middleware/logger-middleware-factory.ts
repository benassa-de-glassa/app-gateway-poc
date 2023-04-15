import * as express from 'express';

import { LabelableLogger } from '@benassa-de-glassa/node-utilities/dist/logger/model';

export interface LoggerEnrichment {
  logger: LabelableLogger;
  correlationId: string;
}

export class LoggerMiddlewareFactory {
  public constructor(private readonly logger: LabelableLogger) {}

  public get(): (
    request: express.Request & Partial<LoggerEnrichment>,
    response: express.Response,
    next: express.NextFunction
  ) => void {
    return (
      request: express.Request & Partial<LoggerEnrichment>,
      _response: express.Response,
      next: express.NextFunction
    ) => {
      request.logger = this.logger;
      next();
    };
  }
}
