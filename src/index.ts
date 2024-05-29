import express from 'express';
import * as redis from 'redis';

import { ConsoleLogger } from '@benassa-de-glassa/logger';
import { ExpressHttpAppBuilder } from '@benassa-de-glassa/servers';

import { SessionCollectionEndpoint } from './endpoints/http/session-collection-endpoint';
import { SessionExtensionCollectionEndpoint } from './endpoints/http/session-extension-collection-endpoint';
import { VerifyEndpoint } from './endpoints/http/verify-endpoint';

const PORT = 8008;

const run = async () => {
  const logger = new ConsoleLogger('app-gateway-service');
  //redis setup
  const redisClient: redis.RedisClientType = redis.createClient();

  const httpApp = new ExpressHttpAppBuilder(logger)
    .withEndpoint('/verify', new VerifyEndpoint(redisClient), [])
    .withEndpoint('/sessions', new SessionCollectionEndpoint(redisClient), [])
    .withEndpoint('/sessions/:sessionId/extensions', new SessionExtensionCollectionEndpoint(redisClient), [])

    .build();

  const app = express();

  app.use('', httpApp);
  app.listen(PORT, () => console.log(`listening on ${PORT}`));
};

run();
