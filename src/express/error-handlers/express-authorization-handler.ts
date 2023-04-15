import express from 'express';
import { AuthorizationError } from '../../errors/authorization-error';

import { Logger } from '@benassa-de-glassa/node-utilities/dist/logger/model';
import { endRequest } from './end-request';

export function handleAuthorizationError(
  error: AuthorizationError,
  request: express.Request & { logger?: Logger },
  response: express.Response,
  next: express.NextFunction
): void {
  if (error.constructor !== AuthorizationError) {
    next(error);
    return;
  }
  if (request.logger != null) {
    request.logger.warning('Handling error as 403', error.json());
  }
  endRequest(response, 403, 'Forbidden');
}
