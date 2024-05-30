import express from 'express';
import * as redis from 'redis';

import { ConsoleLogger } from '@benassa-de-glassa/logger';
import { ExpressHttpAppBuilder } from '@benassa-de-glassa/servers';

import { SessionCollectionEndpoint } from './endpoints/http/session-collection-endpoint';
import { SessionExtensionCollectionEndpoint } from './endpoints/http/session-extension-collection-endpoint';
import { VerifyEndpoint } from './endpoints/http/verify-endpoint';
import { appProxy } from './middleware/routing-middleware';
import { sessionVerifierMiddleware } from './middleware/bearer-token-with-session-verifier-middleware';
import { AuthenticationErrorHandler } from './errors/authentication-error';

const PORT = 8008;
const DELAY_SERVICE = process.env.DELAY_SERVICE ? process.env.DELAY_SERVICE : 'http://localhost:8009';

const REDIS_DB_URI = process.env.REDIS_DB_URI ?? 'redis://localhost:6379';

const run = async () => {
  const logger = new ConsoleLogger('app-gateway-service');
  //redis setup
  const redisClient: redis.RedisClientType = redis.createClient({ url: REDIS_DB_URI });
  await redisClient.connect();

  const httpApp = new ExpressHttpAppBuilder(logger)
    .withEndpoint('/verify', new VerifyEndpoint(redisClient), [])
    .withEndpoint('/sessions', new SessionCollectionEndpoint(redisClient), [])
    .withEndpoint('/sessions/:sessionId/extensions', new SessionExtensionCollectionEndpoint(redisClient), [])
    .withErrorHandlers(AuthenticationErrorHandler)
    .build();

  const app = express();
  app.use('/app-gateway-service', sessionVerifierMiddleware(redisClient, logger), appProxy(DELAY_SERVICE));

  app.use('/', httpApp);
  app.listen(PORT, () => console.log(`listening on ${PORT}`));
};

run();
