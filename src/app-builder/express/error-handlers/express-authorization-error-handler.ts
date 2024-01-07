import * as express from 'express';

import { Logger } from '@benassa-de-glassa/logger';
import { endRequest } from './end-request';
import { AuthorizationError } from '@benassa-de-glassa/http';

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
    request.logger.info({ message: `Handling error as ${error.code}`, error: error.json() });
  }
  endRequest(response, error.code, 'Forbidden');
}
