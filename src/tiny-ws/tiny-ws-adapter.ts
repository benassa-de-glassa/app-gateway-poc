import * as express from 'express';
import { IdGenerator } from '@benassa-de-glassa/node-utilities/dist/utilities/id-generators/id-generator.model.js';
import { UUIDv4IdGenerator } from '@benassa-de-glassa/node-utilities/dist/utilities/id-generators/uuid-v4-id-generator.js';

import { DuplexStreamHandler } from '../model/get-stream-handler.js';
import { tap } from 'rxjs';
import { TinyWSRequest } from 'tinyws';

export type TinyWsHttpHandler = (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => Promise<void>;

export type TinyWsWebSocketHandler = (
  request: express.Request & TinyWSRequest,
  response: express.Response,
  next: express.NextFunction
) => Promise<void>;

export class TinyWsWebSocketAdapter {
  private readonly correlationIdGenerator: IdGenerator = new UUIDv4IdGenerator();

  public adapt(
    duplexStreamHandler: DuplexStreamHandler,
    pathEndpoints: {
      streamHandler?: DuplexStreamHandler;
    }
  ): TinyWsWebSocketHandler {
    return async (request: express.Request & TinyWSRequest) => {
      const socket = await request.ws();
      socket.on('message', (event: MessageEvent) => {
        duplexStreamHandler.handleMessage.call(pathEndpoints, {
          message: event.toString(),
          body: request.body,
          lowercaseHeaders: request.headers,
          urlParameters: request.params,
          queryParameters: request.query,
          correlationId: this.correlationIdGenerator.generatedId()
        });
      });
      const subscription = duplexStreamHandler.sendMessage$.pipe(tap(message => socket.send(message))).subscribe();
      socket.on('close', () => subscription.unsubscribe());
    };
  }
}
