import * as express from 'express';
import { Logger } from '@benassa-de-glassa/node-utilities/dist/logger/model';

import { endRequest } from './end-request';

export function handleUnknownError(
  error: Error,
  request: express.Request & { logger?: Logger },
  response: express.Response,
  _next: express.NextFunction
): void {
  if (request.logger != null) {
    request.logger.warning({ message: 'Handling error as 500', error: error });
  } else {
    console.error('Handling error as 500', { ...error });
  }
  endRequest(response, 500, 'Internal Server Error');
}
