import * as express from 'express';

import { Logger } from '@benassa-de-glassa/logger';
import { endRequest } from './end-request';
import { ValidationError } from '@benassa-de-glassa/validation';

export function handleValidationError(
  error: ValidationError,
  request: express.Request & { logger?: Logger },
  response: express.Response,
  next: express.NextFunction
): void {
  if (error.constructor !== ValidationError) {
    next(error);
    return;
  }
  if (request.logger != null) {
    request.logger.info({ message: 'Handling error as 422', error: error.details });
  }
  endRequest(response, 422, 'Unprocessable Content');
}
