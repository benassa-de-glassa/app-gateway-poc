import * as express from 'express';

import { Observable, tap, catchError, of } from 'rxjs';
import { EndpointResponse } from '../../express-common/model/handlers';
import { ResponseHandler } from './response.handler';
import { Logger } from '@benassa-de-glassa/logger';

export class EventStreamResponseHandler implements ResponseHandler {
  public constructor(
    private readonly response: express.Response & Partial<{ logger: Logger }>,
    private readonly next: express.NextFunction
  ) {}
  public async handle(response$: Observable<EndpointResponse>): Promise<void> {
    this.response.setHeader('Cache-Control', 'no-cache');
    this.response.setHeader('Content-Type', 'text/event-stream');
    this.response.setHeader('Access-Control-Allow-Origin', '*');
    this.response.setHeader('Connection', 'keep-alive');
    this.response.flushHeaders(); // flush the headers to establish SSE with client

    const subscription = response$
      .pipe(
        tap(({ payload, headers }) => {
          Object.entries(headers ?? {}).forEach(([key, value]) => this.response.setHeader(key, value));

          if (payload?.id != null) {
            this.response.write(`id: ${payload?.id}\n`);
          }
          this.response.write(`event: message\n`);
          this.response.write(`data: ${JSON.stringify(payload)}\n\n`);
        }),
        catchError(error => {
          this.response.write(`event: error\n`);
          this.response.write(`data: ${JSON.stringify(error)}\n\n`);
          return of();
        })
      )
      .subscribe();

    this.response.on('finish', () => {
      subscription.unsubscribe();
    });
  }
}
