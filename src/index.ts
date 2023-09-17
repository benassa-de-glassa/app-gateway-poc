import { MongoClient } from 'mongodb';
import * as redis from 'redis';
import * as winston from 'winston';

import { RedisPubSub } from '@benassa-de-glassa/pub-sub';
import { WinstonLogger } from '@benassa-de-glassa/logger';
import { MongoDbService } from '@benassa-de-glassa/document-service';

import { ExpressAppBuilder } from './express/express-app-builder';
import { BroadcastDuplexStreamHandlerEndpoint } from './endpoints/echo-duplex-stream-endpoint-handler';
import { FixedTimeIntervalResponseEndpoint } from './endpoints/fixed-time-interval-response-endpoint-handler';
import { PubSubEventStreamEndpoint } from './endpoints/pub-sub-event-stream-endpoint';
import { NoopTokenVerifier } from './express/token-verifiers/noop-token-verifier';
import { DocumentCollectionEndpoint } from './endpoints/document-collection-endpoint';
import { DocumentResourceEndpoint } from './endpoints/document-resource-endpoint';
import { UUIDv4IdGenerator } from '@benassa-de-glassa/utilities';

const run = async () => {
  const redisClient: redis.RedisClientType = redis.createClient();
  const subscriber: redis.RedisClientType = redisClient.duplicate();
  await redisClient.connect();
  await subscriber.connect();

  const mongoDbConnection = new MongoClient('mongodb://localhost:27017');
  await mongoDbConnection.connect();

  const logger = new WinstonLogger(
    winston.createLogger({ format: winston.format.json() }),
    [{ transport: 'seq', level: 'debug', connectionUri: 'http://localhost:5341' }],
    'sample-service'
  );

  const resourceCollection = mongoDbConnection.db('sample-service').collection<any>('resource');

  const resourceService = new MongoDbService(
    resourceCollection,
    { fromDatabase: (doc: any) => doc },
    new UUIDv4IdGenerator(),
    logger
  );

  const app = new ExpressAppBuilder(new NoopTokenVerifier(), new NoopTokenVerifier(), new NoopTokenVerifier(), logger)
    .withAppEndpoints('v1', {
      '/resource': new DocumentCollectionEndpoint<any>(resourceService),
      '/resource/:resourceId': new DocumentResourceEndpoint<any>(resourceService),
      '/time': new FixedTimeIntervalResponseEndpoint(),
      '/echo': new BroadcastDuplexStreamHandlerEndpoint(),
      '/pub-sub-streaming': new PubSubEventStreamEndpoint(
        new RedisPubSub(subscriber, 'test'),
        new RedisPubSub(redisClient, 'test')
      )
    })
    .build();

  app.listen(8008, () => 'listening on 8008');
};

run();
