import express from 'express';
import { AuthenticationError } from '../../errors/authentication-error';

import { Logger } from '@benassa-de-glassa/node-utilities/dist/logger/model';
import { endRequest } from './end-request';

export function handleAuthenticationError(
  error: AuthenticationError,
  request: express.Request & { logger?: Logger },
  response: express.Response,
  next: express.NextFunction
): void {
  if (error.constructor !== AuthenticationError) {
    next(error);
    return;
  }
  if (request.logger != null) {
    request.logger.warning('Handling error as 401', error.json());
  }
  endRequest(response, 401, 'Unauthorized');
}
