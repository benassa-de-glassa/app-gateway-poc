import { Logger } from '@benassa-de-glassa/logger';
import { Publisher, Subscriber } from '@benassa-de-glassa/pub-sub';

import { filter, map, of } from 'rxjs';
import { GetEndpoint, ResponseType, EndpointRequest, PostEndpoint } from '../app-builder/express/model/handlers';

export class PubSubStreamEndpoint implements GetEndpoint, PostEndpoint {
  public static readonly PATH = '/sse';

  public constructor(private readonly eventSubscriber: Subscriber, private readonly eventPublisher: Publisher) {}

  public get GET() {
    return {
      responseTypes: new Set([ResponseType.eventStream]),
      handler: (_request: EndpointRequest, _token: Record<string, unknown>, _logger: Logger) => {
        const response$ = this.eventSubscriber?.subscribe();
        return response$.pipe(
          filter(response => response != null),
          map(response => ({ payload: response, code: 200 }))
        );
      }
    };
  }

  public get POST() {
    return {
      responseTypes: new Set([ResponseType.object]),
      handler: (request: EndpointRequest, _token: Record<string, unknown>, _logger: Logger) => {
        this.eventPublisher.publish(request.body);
        return of({ payload: undefined, code: 200 });
      }
    };
  }
}
