import * as express from 'express';
import { InvalidRequestError } from '../../errors/invalid-request-error';

import { Logger } from '@benassa-de-glassa/node-utilities/dist/logger/model';
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
    request.logger.warning('Handling error as 400', error.json());
  }
  endRequest(response, 400, 'Bad Request');
}
