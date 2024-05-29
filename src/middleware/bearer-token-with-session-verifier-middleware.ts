import * as redis from 'redis';
import * as express from 'express';
import { SessionVerificationHandler } from '../handlers/session-verification-handler';
import { SessionTokenDecodeVerifier } from '../authentication/token-verifiers/session-token-decode-verifier';
import { RedisCache } from '@benassa-de-glassa/cache';
import { CurrentDateService } from '@benassa-de-glassa/utilities';
export const sessionVerifierMiddleware =
  (redis: redis.RedisClientType) => async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const baseTokenVerifier = new SessionTokenDecodeVerifier();
    const cache = new RedisCache<string>(redis);

    const verifier = new SessionVerificationHandler(baseTokenVerifier, cache, new CurrentDateService());
    await verifier.verifySession(req.headers.authorization?.split(' ')[1] ?? '');
    next();
  };
