import redis, { RedisClientType } from 'redis';

import { RedisPublisher } from '@benassa-de-glassa/node-utilities/dist/pub-sub/redis/redis-publisher.js';
import { RedisSubscriber } from '@benassa-de-glassa/node-utilities/dist/pub-sub/redis/redis-subscriber.js';

import { ExpressTinyWsAppBuilder } from './tiny-ws/tiny-ws-builder.js';
import { BroadcastDuplexStreamHandlerEndpoint } from './ws-endpoints/echo-duplex-stream-endpoint-handler.js';
import { FixedTimeIntervalResponseEndpoint } from './ws-endpoints/fixed-time-interval-response-endpoint-handler.js';
import { PubSubEventStreamEndpoint } from './ws-endpoints/pub-sub-event-stream-endpoint.js';

const redisClient: RedisClientType = redis.createClient();
const subscriber: RedisClientType = redisClient.duplicate();
await redisClient.connect();
await subscriber.connect();

const app = new ExpressTinyWsAppBuilder()
  .withAppEndpoints('v1', {
    '/time': new FixedTimeIntervalResponseEndpoint(),
    '/echo': new BroadcastDuplexStreamHandlerEndpoint(),
    '/resource-streaming': new PubSubEventStreamEndpoint(
      new RedisSubscriber(subscriber, 'test'),
      new RedisPublisher(redisClient, 'test')
    )
  })
  .build();

app.listen(8080);
