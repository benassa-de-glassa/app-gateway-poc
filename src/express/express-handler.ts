import * as express from 'express';

export type ExpressHandler = (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => Promise<void>;
