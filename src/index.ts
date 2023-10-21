// import { MongoClient } from 'mongodb';
import * as redis from 'redis';
import * as winston from 'winston';

// import { MongoDbService } from '@benassa-de-glassa/document-service';
import { ExpressAppBuilder } from '@benassa-de-glassa/express-server';
import { WinstonLogger } from '@benassa-de-glassa/logger';
import { RedisPubSub } from '@benassa-de-glassa/pub-sub';
import { UUIDv4IdGenerator } from '@benassa-de-glassa/utilities';

import { DocumentCollectionEndpoint } from './endpoints/document-collection-endpoint';
import { DocumentResourceEndpoint } from './endpoints/document-resource-endpoint';
import { BroadcastDuplexStreamHandlerEndpoint } from './endpoints/echo-duplex-stream-endpoint-handler';
import { FixedTimeIntervalResponseEndpoint } from './endpoints/fixed-time-interval-response-endpoint-handler';
import { PubSubEventWebsocketStreamEndpoint } from './endpoints/pub-sub-event-websocket-stream-endpoint';

import { NoopTokenVerifier } from './authentication/token-verifiers/noop-token-verifier';

import { RedocEndpoint } from './docs/redoc-endpoint';
import { SwaggerFileEndpoint } from './endpoints/swagger-file-endpoint';
import { ServerSentEventWebsocketStreamEndpoint } from './endpoints/server-sent-event-websocket-stream-endpoint';
import { FirestoreService } from '@benassa-de-glassa/document-service';
import { DocumentCollectionStreamEndpoint } from './endpoints/document-collection-stream-endpoint';

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../service-account.json');

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

  // mongo setup
  // const mongoDbConnection = new MongoClient(
  //   'mongodb://mongo:daF2aEGB2b33hDc52HfDGDhDf1faH4B3@roundhouse.proxy.rlwy.net:26570/'
  // );
  // await mongoDbConnection.connect();
  // const resourceCollection = mongoDbConnection.db('sample-service').collection<any>('resource');

  // const resourceService = new MongoDbService(
  //   resourceCollection,
  //   { fromDatabase: (doc: any) => doc },
  //   new UUIDv4IdGenerator(),
  //   logger
  // );

  const app = new ExpressAppBuilder(new NoopTokenVerifier(), new NoopTokenVerifier(), new NoopTokenVerifier(), logger)
    .withAppEndpoints('v1', {
      '/docs/swagger.json': new SwaggerFileEndpoint('src/docs/swagger.json'),
      '/docs': new RedocEndpoint('API Docs', '/app/v1/docs/swagger.json', new UUIDv4IdGenerator()),
      '/resources': new DocumentCollectionEndpoint<any>(resourceService),
      '/resources-stream': new DocumentCollectionStreamEndpoint<any>(resourceService),
      '/resources/:resourceId': new DocumentResourceEndpoint<any>(resourceService),
      '/time': new FixedTimeIntervalResponseEndpoint(),
      '/echo': new BroadcastDuplexStreamHandlerEndpoint(),
      '/sse': new ServerSentEventWebsocketStreamEndpoint(
        new RedisPubSub(subscriber, 'sse'),
        new RedisPubSub(publisher, 'sse')
      ),
      '/ws': new PubSubEventWebsocketStreamEndpoint(new RedisPubSub(subscriber, 'ws'), new RedisPubSub(publisher, 'ws'))
    })
    .build();

  app.listen(8008, () => console.log('listening on 8008'));
};

run();
