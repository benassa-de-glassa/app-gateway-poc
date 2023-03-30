import { ExpressTinyWsAppBuilder } from './tiny-ws/tiny-ws-builder.js';
import { BroadcastDuplexStreamHandlerEndpoint } from './ws-endpoints/echo-duplex-stream-endpoint-handler.js';
import { FixedTimeIntervalResponseEndpoint } from './ws-endpoints/fixed-time-interval-response-endpoint-handler.js';

const app = new ExpressTinyWsAppBuilder()
  .withAppEndpoints('v1', {
    '/time': new FixedTimeIntervalResponseEndpoint(),
    '/echo': new BroadcastDuplexStreamHandlerEndpoint()
  })
  .build();

app.listen(8080);
