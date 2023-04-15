import * as express from 'express';
import { EMPTY, filter, tap } from 'rxjs';
import { WebSocket, WebSocketServer } from 'ws';

import { DuplexStreamHandler } from './model/handlers';
import { AuthenticationEnrichment } from './middleware/authentication-middleware-factory';
import { LoggerEnrichment } from './middleware/logger-middleware-factory';

export type ExpressWsHandler = (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => Promise<void>;

export class ExpressWebSocketAdapter {
  private readonly wss = new WebSocketServer({ noServer: true });

  public adapt(
    duplexStreamHandler: DuplexStreamHandler,
    pathEndpoints: {
      streamHandler?: DuplexStreamHandler;
    }
  ): ExpressWsHandler {
    return async (request: express.Request & Partial<AuthenticationEnrichment> & Partial<LoggerEnrichment>) => {
      const upgradeHeader = (request.headers.upgrade || '').split(',').map(s => s.trim());

      // When upgrade header contains "websocket" its index is 0
      if (upgradeHeader.indexOf('websocket') === 0) {
        const socket = await new Promise<WebSocket & Partial<{ clientId: string }>>((resolve, reject) => {
          this.wss.handleUpgrade(request, request.socket, Buffer.alloc(0), ws => {
            try {
              this.wss.emit('connection', ws, request);
              resolve(ws);
            } catch (error) {
              reject(error);
            }
          });
        });
        socket['clientId'] = request.headers['sec-websocket-key'];

        socket.on('message', (event: MessageEvent) => {
          if (request.token == null || request.logger == null) {
            throw new Error('Middleware setup incorrectly');
          }

          duplexStreamHandler.handleMessage.call(
            pathEndpoints,
            {
              clientId: request.headers['sec-websocket-key'] ?? '',
              message: event?.toString() ?? '',
              body: request.body,
              lowercaseHeaders: request.headers,
              urlParameters: request.params,
              queryParameters: request.query
            },
            request.token,
            request.logger
          );
        });

        const messageSubscription = (duplexStreamHandler.sendMessage$ ?? EMPTY)
          .pipe(
            filter((message: { targets: Set<string>; message: any }) => message.targets.has(socket['clientId'] ?? '')),
            tap((message: { targets: Set<string>; message: any }) => socket.send(message.message))
          )
          .subscribe();

        const broadcastSubscription = (duplexStreamHandler.broadcastMessage$ ?? EMPTY)
          .pipe(tap((message: string) => socket.send(message)))
          .subscribe();

        socket.emit('message');
        socket.on('close', () => {
          broadcastSubscription.unsubscribe();
          messageSubscription.unsubscribe();
        });
      }
    };
  }
}
