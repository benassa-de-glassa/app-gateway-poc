import * as express from 'express';

import { IdGenerator } from '@benassa-de-glassa/node-utilities/dist/utilities/id-generators/id-generator.model';

import { LoggerEnrichment } from './logger-middleware-factory';

export interface CorrelationIdEnrichment {
  correlationId: string;
}

export class CorrelationIdMiddlewareFactory {
  public constructor(
    private readonly correlationIdGenerator: IdGenerator,
    private readonly correlationIdHeaderName: string
  ) {}

  public get(): (
    request: express.Request & Partial<LoggerEnrichment>,
    response: express.Response,
    next: express.NextFunction
  ) => void {
    return (
      request: express.Request & Partial<LoggerEnrichment>,
      response: express.Response,
      next: express.NextFunction
    ) => {
      if (request.logger == null) {
        throw new Error('Middleware setup incorrectly');
      }
      const correlationId = this.getCorrelationId(request);
      this.setCorrelationId(correlationId, request, response);

      request.logger.withLabel({ name: 'correlationId', value: correlationId });
      next();
    };
  }

  private getCorrelationId(request: express.Request & Partial<LoggerEnrichment>): string {
    return (
      request.correlationId ?? request.get(this.correlationIdHeaderName) ?? this.correlationIdGenerator.generatedId()
    );
  }

  private setCorrelationId(
    correlationId: string,
    request: express.Request & Partial<LoggerEnrichment>,
    response: express.Response
  ): void {
    response.set(this.correlationIdHeaderName, correlationId);
    request.correlationId = correlationId;
  }
}
