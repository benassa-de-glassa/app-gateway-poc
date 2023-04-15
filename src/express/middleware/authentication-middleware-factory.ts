import * as express from 'express';
import { AuthenticationToken, TokenVerifier } from '../token-verifiers/token-verifier';
import { LoggerEnrichment } from './logger-middleware-factory';

export interface AuthenticationEnrichment {
  token: AuthenticationToken;
}

export class AuthenticationMiddlewareFactory {
  public getFor(
    verifier: TokenVerifier
  ): (
    request: express.Request & Partial<LoggerEnrichment>,
    _: express.Response,
    next: express.NextFunction
  ) => Promise<void> {
    return async (
      request: express.Request & Partial<LoggerEnrichment> & Partial<AuthenticationEnrichment>,
      _: express.Response,
      next: express.NextFunction
    ) => {
      try {
        request.token = await verifier.verify(request.headers?.authorization ?? '');
        request.logger?.withLabel({ name: 'token', value: request.token });
      } catch (error) {
        next(error);
        return;
      }
      next();
    };
  }
}
