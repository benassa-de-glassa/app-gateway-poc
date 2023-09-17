import { StreamEndpoint, WebSocketRequest } from '@benassa-de-glassa/express-server';
import { Publisher, Subscriber } from '@benassa-de-glassa/pub-sub';

import { map } from 'rxjs';

export class PubSubEventStreamEndpoint implements StreamEndpoint {
  public constructor(private readonly eventSubscriber: Subscriber, private readonly eventPublisher: Publisher) {}

  public get streamHandler() {
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
