import * as express from 'express';
import { Logger } from '@benassa-de-glassa/node-utilities/dist/logger/model';

import { AuthenticationError } from '../../errors/authentication-error';
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
    request.logger.notice({ message: 'Handling error as 401', error: error.json() });
  }
  endRequest(response, 401, 'Unauthorized');
}
