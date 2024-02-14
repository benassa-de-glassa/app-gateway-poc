import express from 'express';

import { Firestore } from '@google-cloud/firestore';
import * as redis from 'redis';
import * as winston from 'winston';

import { FirestoreService } from '@benassa-de-glassa/document-service';
import { WinstonLogger } from '@benassa-de-glassa/logger';
import { RedisPubSub } from '@benassa-de-glassa/pub-sub';
import { ExpressHttpAppBuilder, ExpressWsAppBuilder } from '@benassa-de-glassa/servers';
import { UUIDv4IdGenerator } from '@benassa-de-glassa/utilities';
import { PubSubStreamEndpoint } from './endpoints/http/pub-sub-stream-endpoint';

import { DocumentCollectionEndpoint } from './endpoints/http/document-collection-endpoint';
import { DocumentResourceEndpoint } from './endpoints/http/document-resource-endpoint';
import { FileUploadEndpoint } from './endpoints/http/file-upload-endpoint';
import { FixedTimeIntervalStreamEndpoint } from './endpoints/http/fixed-time-interval-stream-endpoint';
import { RedocEndpoint } from './endpoints/http/redoc-endpoint';
import { SwaggerFileEndpoint } from './endpoints/http/swagger-file-endpoint';
import { BroadcastDuplexStreamHandlerEndpoint } from './endpoints/ws/echo-duplex-stream-endpoint-handler';
import { PubSubEventWebsocketStreamEndpoint } from './endpoints/ws/pub-sub-event-websocket-stream-endpoint';

import { DocumentNotFoundErrorHandler } from './error-handlers';

const PORT = 8008;

const run = async () => {
  // logger setup
  const logger = new WinstonLogger(
    winston.createLogger({ format: winston.format.json() }),
    [{ transport: 'seq', level: 'debug', connectionUri: 'http://localhost:5341' }],
    'sample-service'
  );

  // firestore setup
  const db = new Firestore({ keyFilename: './service-account.json' });
  const resourceCollection = db.collection('users');
  const resourceService = new FirestoreService(resourceCollection, new UUIDv4IdGenerator(), logger);

  //redis setup
  const publisher: redis.RedisClientType = redis.createClient();
  const subscriber: redis.RedisClientType = publisher.duplicate();
  await publisher.connect();
  await subscriber.connect();

  const httpApp = new ExpressHttpAppBuilder(logger)
    .withEndpoint('/docs', new RedocEndpoint('sample-service', '/docs/swagger.json', new UUIDv4IdGenerator()), [])
    .withEndpoint('/docs/swagger.json', new SwaggerFileEndpoint('src/docs/swagger.json'), [])
    .withEndpoint('/resources', new DocumentCollectionEndpoint<any>(resourceService), [])
    .withEndpoint('/resources/:resourceId', new DocumentResourceEndpoint<any>(resourceService), [])
    .withEndpoint('/time', new FixedTimeIntervalStreamEndpoint(), [])
    .withEndpoint('/upload', new FileUploadEndpoint(new RedisPubSub(publisher, 'sse')), [])
    .withEndpoint(
      '/sse',
      new PubSubStreamEndpoint(new RedisPubSub(subscriber, 'sse'), new RedisPubSub(publisher, 'sse')),
      []
    )
    .withErrorHandlers(DocumentNotFoundErrorHandler)
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
