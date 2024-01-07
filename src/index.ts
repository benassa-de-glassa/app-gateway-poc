import express from 'express';

// import { MongoClient } from 'mongodb';
// import { MongoDbService } from '@benassa-de-glassa/document-service';

import * as redis from 'redis';
import * as winston from 'winston';

import { WinstonLogger } from '@benassa-de-glassa/logger';
import { RedisPubSub } from '@benassa-de-glassa/pub-sub';
import { UUIDv4IdGenerator } from '@benassa-de-glassa/utilities';

import { DocumentCollectionEndpoint } from './endpoints/http/document-collection-endpoint';
import { DocumentResourceEndpoint } from './endpoints/http/document-resource-endpoint';
import { BroadcastDuplexStreamHandlerEndpoint } from './endpoints/ws/echo-duplex-stream-endpoint-handler';
import { FixedTimeIntervalStreamEndpoint } from './endpoints/http/fixed-time-interval-stream-endpoint';
import { PubSubEventWebsocketStreamEndpoint } from './endpoints/ws/pub-sub-event-websocket-stream-endpoint';

import { FirestoreService } from '@benassa-de-glassa/document-service';
import { RedocEndpoint } from './docs/redoc-endpoint';
import { PubSubStreamEndpoint } from './endpoints/http/pub-sub-stream-endpoint';
import { SwaggerFileEndpoint } from './endpoints/http/swagger-file-endpoint';

import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { ExpressHttpAppBuilder } from './app-builder/express-http/express-http-app-builder';
import { FileUploadEndpoint } from './endpoints/http/file-upload-endpoint';
import { ExpressWsAppBuilder } from './app-builder';

const serviceAccount = require('../service-account.json');

const PORT = 8013;

const run = async () => {
  // logger setup
  const logger = new WinstonLogger(
    winston.createLogger({ format: winston.format.json() }),
    [{ transport: 'seq', level: 'debug', connectionUri: 'http://localhost:5341' }],
    'sample-service'
  );

  //firestore setup
  initializeApp({
    credential: cert(serviceAccount)
  });
  const db = getFirestore();
  const resourceCollection = db.collection('users');
  const resourceService = new FirestoreService(resourceCollection, new UUIDv4IdGenerator(), logger);

  //redis setup
  const publisher: redis.RedisClientType = redis.createClient();
  const subscriber: redis.RedisClientType = publisher.duplicate();
  await publisher.connect();
  await subscriber.connect();

  const httpApp = new ExpressHttpAppBuilder(logger)
    .withEndpoint('/docs/swagger.json', new SwaggerFileEndpoint('src/docs/swagger.json'), [])
    .withEndpoint('/docs', new RedocEndpoint('API Docs', '/docs/swagger.json', new UUIDv4IdGenerator()), [])
    .withEndpoint('/resources', new DocumentCollectionEndpoint<any>(resourceService), [])
    .withEndpoint('/resources/:resourceId', new DocumentResourceEndpoint<any>(resourceService), [])
    .withEndpoint('/time', new FixedTimeIntervalStreamEndpoint(), [])
    .withEndpoint('/upload', new FileUploadEndpoint(new RedisPubSub(publisher, 'sse')), [])
    .withEndpoint(
      '/sse',
      new PubSubStreamEndpoint(new RedisPubSub(subscriber, 'sse'), new RedisPubSub(publisher, 'sse')),
      []
    )

    .build();

  const wsApp = new ExpressWsAppBuilder(logger)
    .withEndpoint(
      '/ws',
      new PubSubEventWebsocketStreamEndpoint(new RedisPubSub(subscriber, 'ws'), new RedisPubSub(publisher, 'ws')),
      []
    )
    .withEndpoint('/echo', new BroadcastDuplexStreamHandlerEndpoint(), [])
    .build();

  const app = express();
  app.use('/ws', wsApp);
  app.use('', httpApp);
  app.listen(PORT, () => console.log(`listening on ${PORT}`));
};

run();
