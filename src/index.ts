import { MongoClient } from 'mongodb';
import * as redis from 'redis';

import { RedisPublisher } from '@benassa-de-glassa/node-utilities/dist/pub-sub/redis/redis-publisher';
import { RedisSubscriber } from '@benassa-de-glassa/node-utilities/dist/pub-sub/redis/redis-subscriber';
import { ConsoleLogger } from '@benassa-de-glassa/node-utilities/dist/logger/console/console-logger';

import { ExpressAppBuilder } from './express/express-app-builder';
import { BroadcastDuplexStreamHandlerEndpoint } from './endpoints/echo-duplex-stream-endpoint-handler';
import { FixedTimeIntervalResponseEndpoint } from './endpoints/fixed-time-interval-response-endpoint-handler';
import { PubSubEventStreamEndpoint } from './endpoints/pub-sub-event-stream-endpoint';
import { NoopTokenVerifier } from './express/token-verifiers/noop-token-verifier';

const run = async () => {
  const redisClient: redis.RedisClientType = redis.createClient();
  const subscriber: redis.RedisClientType = redisClient.duplicate();
  await redisClient.connect();
  await subscriber.connect();

  const mongoDbConnection = new MongoClient('mongodb://localhost:27017');
  await mongoDbConnection.connect();

  const app = new ExpressAppBuilder(
    new NoopTokenVerifier(),
    new NoopTokenVerifier(),
    new NoopTokenVerifier(),
    new ConsoleLogger('sample-service')
  )
    .withAppEndpoints('v1', {
      '/time': new FixedTimeIntervalResponseEndpoint(),
      '/echo': new BroadcastDuplexStreamHandlerEndpoint(),
      '/pub-sub-streaming': new PubSubEventStreamEndpoint(
        new RedisSubscriber(subscriber, 'test'),
        new RedisPublisher(redisClient, 'test')
      )
    })
    .build();

  app.listen(8008, () => 'listening on 8008');
};

run();
