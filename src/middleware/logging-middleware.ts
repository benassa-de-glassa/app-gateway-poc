import { Logger } from '@benassa-de-glassa/logger';
import * as express from 'express';

export const loggingMiddleware =
  (logger: Logger) => async (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    logger.info('Request received', { method: req.method, url: req.url });

    next();
  };
