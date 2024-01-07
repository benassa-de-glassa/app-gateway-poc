import * as express from 'express';

import { Logger } from '@benassa-de-glassa/logger';
import { endRequest } from './end-request';
import { NotAcceptableError } from '@benassa-de-glassa/http';

export function handleNotAcceptableError(
  error: NotAcceptableError,
  request: express.Request & { logger?: Logger },
  response: express.Response,
  next: express.NextFunction
): void {
  if (error.constructor !== NotAcceptableError) {
    next(error);
    return;
  }
  if (request.logger != null) {
    request.logger.debug({ message: `Handling error as ${error.code}`, error: error.json() });
  }
  endRequest(response, error.code, 'Not Acceptable');
}
