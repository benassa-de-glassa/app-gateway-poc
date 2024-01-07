import * as express from 'express';
import { Logger } from '@benassa-de-glassa/logger';

import { endRequest } from './end-request';
import { AuthenticationError } from '@benassa-de-glassa/http';

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
    request.logger.notice({ message: `Handling error as ${error.code}`, error: error.json() });
  }
  endRequest(response, error.code, 'Unauthorized');
}
