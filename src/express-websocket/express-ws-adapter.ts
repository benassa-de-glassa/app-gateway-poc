import * as express from 'express';
import { WebSocket } from 'ws';
import { IdGenerator } from '@benassa-de-glassa/node-utilities/dist/utilities/id-generators/id-generator.model.js';
import { UUIDv4IdGenerator } from '@benassa-de-glassa/node-utilities/dist/utilities/id-generators/uuid-v4-id-generator.js';

import { DuplexStreamHandler } from '../model/get-stream-handler.js';
import { catchError, EMPTY, Subscription, tap } from 'rxjs';

export type ExpressHttpHandler = (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => Promise<void>;

export type ExpressWebSocketHandler = (
  socket: WebSocket,
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => Promise<void>;

export class ExpressWebSocketAdapter {
  private readonly correlationIdGenerator: IdGenerator = new UUIDv4IdGenerator();

  public adapt(
    websocketHandler: DuplexStreamHandler,
    pathEndpoints: {
      streamHandler?: DuplexStreamHandler;
    }
  ): ExpressWebSocketHandler {
    return async (socket: WebSocket, request: express.Request) => {
      try {
        const { stream$ } = await websocketHandler.call(pathEndpoints, {
          body: request.body,
          lowercaseHeaders: request.headers,
          urlParameters: request.params,
          queryParameters: request.query,
          correlationId: this.correlationIdGenerator.generatedId()
        });

        let subscription: Subscription;
        if (stream$ != null) {
          subscription = stream$
            .pipe(
              tap((value: unknown) => socket.send(JSON.stringify(value))),
              catchError(error => {
                socket.close();
                return EMPTY;
              })
            )
            .subscribe();
        }
        socket.on('close', () => subscription.unsubscribe());
      } catch (error) {
        return;
      }
    };
  }
}
