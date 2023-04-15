import * as express from 'express';
import { NotFoundError } from '../../errors/not-found-error';

import { Logger } from '@benassa-de-glassa/node-utilities/dist/logger/model';
import { endRequest } from './end-request';

export function handleNotFoundError(
  error: NotFoundError,
  request: express.Request & { logger?: Logger },
  response: express.Response,
  next: express.NextFunction
): void {
  if (error.constructor !== NotFoundError) {
    next(error);
    return;
  }
  if (request.logger != null) {
    request.logger.warning('Handling error as 404', error.json());
  }
  endRequest(response, 404, 'Not Found');
}
