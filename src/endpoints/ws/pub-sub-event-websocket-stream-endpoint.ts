import { Publisher, Subscriber } from '@benassa-de-glassa/pub-sub';

import { map } from 'rxjs';
import { StreamEndpoint, WebSocketRequest } from '@benassa-de-glassa/servers';

export class PubSubEventWebsocketStreamEndpoint implements StreamEndpoint {
  public constructor(private readonly eventSubscriber: Subscriber, private readonly eventPublisher: Publisher) {}

  public get stream() {
    const clientToSendTo: Set<string> = new Set([]);

    const handleMessage = (request: WebSocketRequest) => {
      if (clientToSendTo.size === 0) {
        clientToSendTo.add(request.clientId);
      }
      this.eventPublisher.publish(request.message);
    };

    return {
      sendMessage$: this.eventSubscriber.subscribe().pipe(map(message => ({ targets: clientToSendTo, message }))),
      handleMessage
    };
  }
}
