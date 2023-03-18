import express = require('express');
import expressWs = require('express-ws');
import { WebSocket } from 'ws';
import { ExpressWebSocketAdapter } from './express-websocket/express-web-socket-adapter.js';
import { FixedTimeIntervalResponseEndpoint } from './ws-endpoints/fixed-time-interval-response-endpoint-handler.js';
const expressApp = express();
const app = expressWs(expressApp).app;

const adapter = new ExpressWebSocketAdapter();

app.ws('/echo', function (ws: WebSocket, req: express.Request) {
  const handler = adapter.adapt(new FixedTimeIntervalResponseEndpoint().getHandler, {
    handler: new FixedTimeIntervalResponseEndpoint().getHandler
  });
  handler(ws, req);

  //   ws.on('message', function (msg: any) {
  //     ws.send(msg + '123');
  //   });
});

app.listen(8080);
