import * as express from 'express';
import { InvalidRequestError } from '../../errors/invalid-request-error';

import { Logger } from '@benassa-de-glassa/logger';
import { endRequest } from './end-request';

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
    request.logger.info({ message: 'Handling error as 400', error: error.json() });
  }
  endRequest(response, 400, 'Bad Request');
}
