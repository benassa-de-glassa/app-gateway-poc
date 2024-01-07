import * as express from 'express';

import { Observable, catchError, firstValueFrom, of } from 'rxjs';
import { EndpointResponse } from '../model/handlers';
import { ResponseHandler } from './response.handler';
import { XOR } from './xor.model';

export class HTMLResponseHandler implements ResponseHandler {
  public constructor(private readonly response: express.Response, private readonly next: express.NextFunction) {}
  public async handle(response: Observable<EndpointResponse>): Promise<void> {
    try {
      const evaluatedResponse: XOR<EndpointResponse, { error: Error }> = await firstValueFrom(
        response.pipe(catchError(error => of({ error })))
      );
      if (evaluatedResponse.error) {
        this.next(evaluatedResponse.error);
        return;
      }

      const { code, payload, headers } = evaluatedResponse;
      Object.entries(headers ?? {}).forEach(([key, value]) => this.response.setHeader(key, value));
      this.response.setHeader('content-type', 'text/html').status(code).send(payload);
    } catch (error) {
      this.next(error);
      return;
    }
  }
}
