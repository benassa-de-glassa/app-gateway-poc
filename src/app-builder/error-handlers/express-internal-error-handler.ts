import * as express from 'express';
import { Logger } from '@benassa-de-glassa/logger';

import { endRequest } from './end-request';
import { InternalError } from '@benassa-de-glassa/http';

export function handleInternalServerError(
  error: InternalError,
  request: express.Request & { logger?: Logger },
  response: express.Response,
  next: express.NextFunction
): void {
  if (error.constructor !== InternalError) {
    next(error);
    return;
  }
  if (request.logger != null) {
    request.logger.warning({ message: `Handling error as ${error.code}`, error: error.json() });
  }
  endRequest(response, 500, 'Internal Server Error');
}
