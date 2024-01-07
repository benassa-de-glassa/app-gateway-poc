import * as express from 'express';

import { Logger } from '@benassa-de-glassa/logger';
import { endRequest } from './end-request';
import { InvalidRequestError } from '@benassa-de-glassa/http';

export function handleInvalidRequestError(
  error: InvalidRequestError,
  request: express.Request & { logger?: Logger },
  response: express.Response,
  next: express.NextFunction
): void {
  if (error.constructor !== InvalidRequestError) {
    next(error);
    return;
  }
  if (request.logger != null) {
    request.logger.info({ message: `Handling error as ${error.code}`, error: error.json() });
  }
  endRequest(response, error.code, 'Bad Request');
}
