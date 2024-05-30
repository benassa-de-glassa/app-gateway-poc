import express, { request } from 'express';
import * as redis from 'redis';

import { Cache, RedisCache } from '@benassa-de-glassa/cache';
import { ConsoleLogger } from '@benassa-de-glassa/logger';
import { TokenVerifier } from '@benassa-de-glassa/servers';

import { CurrentDateService, UUIDv4IdGenerator } from '@benassa-de-glassa/utilities';
import { SessionTokenDecodeVerifier } from './authentication/token-verifiers/session-token-decode-verifier';
import { SessionCreationHandler } from './handlers/session-creation-handler';
import { SessionExtensionHandler } from './handlers/session-extension-handler';
import { SessionVerificationHandler } from './handlers/session-verification-handler';
import { sessionVerifierMiddleware } from './middleware/bearer-token-with-session-verifier-middleware';
import { appProxy } from './middleware/routing-middleware';

const PORT = 8008;
const DELAY_SERVICE = process.env.DELAY_SERVICE ? process.env.DELAY_SERVICE : 'http://localhost:8009';

const REDIS_DB_URI = process.env.REDIS_DB_URI ?? 'redis://localhost:6379';

const run = async () => {
  const logger = new ConsoleLogger('app-gateway-service');
  //redis setup
  const redisClient: redis.RedisClientType = redis.createClient({ url: REDIS_DB_URI });
  await redisClient.connect();

  const app = express();
  app.post('/verify', async (req, res, _next) => {
    const cache: Cache<string> = new RedisCache<string>(redisClient);
    const baseTokenVerifier: TokenVerifier = new SessionTokenDecodeVerifier();

    const handler = new SessionVerificationHandler(baseTokenVerifier, cache, new CurrentDateService());
    const authorizationHeader = req.headers.authorization;
    if (typeof authorizationHeader !== 'string') {
      res.status(401).send({ error: 'Invalid token' });
    }
    const token = authorizationHeader?.split(' ')[1];
    try {
      const verified = await handler.verifySession(token ?? '');
      res.status(200).json(verified);
    } catch (error) {
      res.status(401).send({ error: 'Invalid token' });
    }
  });

  app.post('/sessions/', async (_req, res, _next) => {
    const cache: Cache<string> = new RedisCache<string>(redisClient);
    const sessionIdGenerator = new UUIDv4IdGenerator();
    const dateService = new CurrentDateService();
    const handler = new SessionCreationHandler(cache, sessionIdGenerator, dateService);
    res.status(201).json({ sessionId: await handler.handleSessionCreation() });
  });

  app.post('/sessions/:sessionId/extensions', async (_req, res, _next) => {
    const cache: Cache<string> = new RedisCache<string>(redisClient);

    const handler = new SessionExtensionHandler(cache, new SessionTokenDecodeVerifier(), new CurrentDateService());

    const authorizationHeader = request.headers.authorization;
    if (typeof authorizationHeader !== 'string') {
      res.status(401).send({ error: 'Invalid token' });
    }
    const token = authorizationHeader?.split(' ')[1];
    try {
      await handler.verify(token ?? '');
      res.status(200).send({});
    } catch (error) {
      res.status(401).send({ error: 'Invalid token' });
    }
  });
  // app.use('/app-gateway-service', sessionVerifierMiddleware(redisClient, logger), appProxy(DELAY_SERVICE));

  app.listen(PORT, () => console.log(`listening on ${PORT}`));
};

run();
