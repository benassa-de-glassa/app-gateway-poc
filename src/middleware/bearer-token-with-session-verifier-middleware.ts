import * as redis from 'redis';
import * as express from 'express';
import { SessionVerificationHandler } from '../handlers/session-verification-handler';
import { SessionTokenDecodeVerifier } from '../authentication/token-verifiers/session-token-decode-verifier';
import { RedisCache } from '@benassa-de-glassa/cache';
import { CurrentDateService } from '@benassa-de-glassa/utilities';
import { Logger } from '@benassa-de-glassa/logger';

export const sessionVerifierMiddleware =
  (redis: redis.RedisClientType, logger: Logger) =>
  async (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    const baseTokenVerifier = new SessionTokenDecodeVerifier();
    const cache = new RedisCache<string>(redis);

    try {
      const verifier = new SessionVerificationHandler(baseTokenVerifier, cache, new CurrentDateService());
      await verifier.verifySession(req.headers.authorization?.split(' ')[1] ?? '');
    } catch (error) {
      logger.error('Authentication Error', error);
      _res.status(401).send({ error: 'Authentication Error' });
      return;
    }

    next();
  };
