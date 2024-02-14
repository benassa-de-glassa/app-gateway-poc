import { Logger } from '@benassa-de-glassa/logger';
import { filter, interval, map } from 'rxjs';
import { EndpointRequest, GetEndpoint, ResponseType } from '@benassa-de-glassa/servers';

export class FixedTimeIntervalStreamEndpoint implements GetEndpoint {
  public get GET() {
    return {
      responseTypes: new Set([ResponseType.eventStream]),
      handler: (_request: EndpointRequest, _token: Record<string, unknown>, _logger: Logger) => {
        return interval(1000).pipe(
          map(() => new Date().toISOString()),
          filter(response => response != null),
          map(response => ({ payload: response, code: 200 }))
        );
      }
    };
  }
}
