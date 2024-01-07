import * as express from 'express';

import { Logger } from '@benassa-de-glassa/logger';
import { endRequest } from './end-request';
import { NotImplementedError } from '@benassa-de-glassa/http';

export function handleNotImplementedError(
  error: NotImplementedError,
  request: express.Request & { logger?: Logger },
  response: express.Response,
  next: express.NextFunction
): void {
  if (error.constructor !== NotImplementedError) {
    next(error);
    return;
  }
  if (request.logger != null) {
    request.logger.debug({ message: `Handling error as ${error.code}`, error: error.json() });
  }
  endRequest(response, error.code, 'Not Acceptable');
}
