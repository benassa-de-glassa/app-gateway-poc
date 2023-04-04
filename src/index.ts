import redis, { RedisClientType } from 'redis';
import { MongoClient } from 'mongodb';
import rethinkdb, { Connection } from 'rethinkdb';

import { RedisPublisher } from '@benassa-de-glassa/node-utilities/dist/pub-sub/redis/redis-publisher.js';
import { RedisSubscriber } from '@benassa-de-glassa/node-utilities/dist/pub-sub/redis/redis-subscriber.js';
import { RethinkDbStreamReadService } from '@benassa-de-glassa/node-utilities/dist/document-service/rethink-db/rethink-db-stream-read.service.js';

import { ExpressAppBuilder } from './express/express-app-builder.js';
import { BroadcastDuplexStreamHandlerEndpoint } from './endpoints/echo-duplex-stream-endpoint-handler.js';
import { FixedTimeIntervalResponseEndpoint } from './endpoints/fixed-time-interval-response-endpoint-handler.js';
import { PubSubEventStreamEndpoint } from './endpoints/pub-sub-event-stream-endpoint.js';
import { DocumentStreamEndpoint } from './endpoints/document-stream-endpoint.js';

const redisClient: RedisClientType = redis.createClient();
const subscriber: RedisClientType = redisClient.duplicate();
await redisClient.connect();
await subscriber.connect();

const rethinkdbConnection: Connection = await rethinkdb.connect({ host: 'localhost', port: 28015 });

const messagestreamService = new RethinkDbStreamReadService(
  rethinkdbConnection,
  rethinkdb.db('sample-service').table('messages')
);

const mongoDbConnection = new MongoClient('mongodb://localhost:27017');
await mongoDbConnection.connect();

const app = new ExpressAppBuilder()
  .withAppEndpoints('v1', {
    '/time': new FixedTimeIntervalResponseEndpoint(),
    '/echo': new BroadcastDuplexStreamHandlerEndpoint(),
    '/document-stream': new DocumentStreamEndpoint(messagestreamService),
    '/pub-sub-streaming': new PubSubEventStreamEndpoint(
      new RedisSubscriber(subscriber, 'test'),
      new RedisPublisher(redisClient, 'test')
    )
  })
  .build();

app.listen(8008, () => 'listening on 8008');
