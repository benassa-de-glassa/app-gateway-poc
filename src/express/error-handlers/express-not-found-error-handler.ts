import * as express from 'express';
import { NotFoundError } from '../../errors/not-found-error';

import { Logger } from '@benassa-de-glassa/logger';
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
    request.logger.debug({ message: 'Handling error as 404', error: error.json() });
  }
  endRequest(response, 404, 'Not Found');
}
