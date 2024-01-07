import * as express from 'express';
import { LoggerEnrichment } from './logger-middleware-factory';
import { ExpressHandler } from '../express-handler';

export const auditLoggingMiddleware: ExpressHandler = async (
  request: express.Request & Partial<LoggerEnrichment>,
  _response: express.Response,
  next: express.NextFunction
) => {
  request.logger?.info({
    meta: 'Audit Log',
    message: 'Handling request',
    method: request.method,
    url: request.url,
  });
  next();
};
