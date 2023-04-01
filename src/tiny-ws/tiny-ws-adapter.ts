import * as express from 'express';
import { IdGenerator } from '@benassa-de-glassa/node-utilities/dist/utilities/id-generators/id-generator.model.js';
import { UUIDv4IdGenerator } from '@benassa-de-glassa/node-utilities/dist/utilities/id-generators/uuid-v4-id-generator.js';

import { DuplexStreamHandler } from '../model/get-stream-handler.js';
import { EMPTY, filter, tap } from 'rxjs';

import { WebSocket, WebSocketServer } from 'ws';

export type ExpressWsHandler = (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => Promise<void>;

export class WebSocketAdapter {
  private readonly correlationIdGenerator: IdGenerator = new UUIDv4IdGenerator();
  private readonly wss = new WebSocketServer({ noServer: true });

  public adapt(
    duplexStreamHandler: DuplexStreamHandler,
    pathEndpoints: {
      streamHandler?: DuplexStreamHandler;
    }
  ): ExpressWsHandler {
    return async (request: express.Request) => {
      const upgradeHeader = (request.headers.upgrade || '').split(',').map(s => s.trim());

      // When upgrade header contains "websocket" its index is 0
      if (upgradeHeader.indexOf('websocket') === 0) {
        const socket = await new Promise<WebSocket>(resolve => {
          this.wss.handleUpgrade(request, request.socket, Buffer.alloc(0), ws => {
            this.wss.emit('connection', ws, request);
            resolve(ws);
          });
        });
        socket['clientId'] = request.headers['sec-websocket-key'];

        socket.on('message', (event: MessageEvent) => {
          duplexStreamHandler.handleMessage.call(pathEndpoints, {
            clientId: request.headers['sec-websocket-key'],
            message: event.toString(),
            body: request.body,
            lowercaseHeaders: request.headers,
            urlParameters: request.params,
            queryParameters: request.query,
            correlationId: this.correlationIdGenerator.generatedId()
          });
        });

        const messageSubscription = (duplexStreamHandler.sendMessage$ ?? EMPTY)
          .pipe(
            filter((message: { targets: Set<string>; message: any }) => message.targets.has(socket['clientId'])),
            tap((message: { targets: Set<string>; message: any }) => socket.send(message.message))
          )
          .subscribe();

        const broadcastSubscription = (duplexStreamHandler.broadcastMessage$ ?? EMPTY)
          .pipe(tap((message: string) => socket.send(message)))
          .subscribe();

        socket.on('close', () => {
          broadcastSubscription.unsubscribe();
          messageSubscription.unsubscribe();
        });
      }
    };
  }
}
