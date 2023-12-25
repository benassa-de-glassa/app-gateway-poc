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
import { FixedTimeIntervalStreamEndpoint } from './endpoints/fixed-time-interval-stream-endpoint';
import { PubSubEventWebsocketStreamEndpoint } from './endpoints/pub-sub-event-websocket-stream-endpoint';

import { NoopTokenVerifier } from './authentication/token-verifiers/noop-token-verifier';

import { RedocEndpoint } from './docs/redoc-endpoint';
import { SwaggerFileEndpoint } from './endpoints/swagger-file-endpoint';
import { PubSubStreamEndpoint } from './endpoints/pub-sub-stream-endpoint';
import { FirestoreService } from '@benassa-de-glassa/document-service';
import { DocumentCollectionStreamEndpoint } from './endpoints/document-collection-stream-endpoint';

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { FileUploadEndpoint } from './endpoints/file-upload-endpoint';
const serviceAccount = require('../service-account.json');

const PORT = 8008;

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

  const app = new ExpressAppBuilder(new NoopTokenVerifier(), new NoopTokenVerifier(), new NoopTokenVerifier(), logger)
    .withAppEndpoints('v1', {
      '/docs/swagger.json': new SwaggerFileEndpoint('src/docs/swagger.json'),
      '/docs': new RedocEndpoint('API Docs', '/app/v1/docs/swagger.json', new UUIDv4IdGenerator()),
      '/resources': new DocumentCollectionEndpoint<any>(resourceService),
      '/resources-stream': new DocumentCollectionStreamEndpoint<any>(resourceService),
      '/resources/:resourceId': new DocumentResourceEndpoint<any>(resourceService),
      '/time': new FixedTimeIntervalStreamEndpoint(),
      '/echo': new BroadcastDuplexStreamHandlerEndpoint(),
      '/upload': new FileUploadEndpoint(new RedisPubSub(publisher, 'sse')),
      '/sse': new PubSubStreamEndpoint(new RedisPubSub(subscriber, 'sse'), new RedisPubSub(publisher, 'sse')),
      '/ws': new PubSubEventWebsocketStreamEndpoint(new RedisPubSub(subscriber, 'ws'), new RedisPubSub(publisher, 'ws'))
    })
    .build();

  app.listen(PORT, () => console.log(`listening on ${PORT}`));
};

run();
