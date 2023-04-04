import { Subscriber } from '@benassa-de-glassa/node-utilities/dist/pub-sub/model/subscriber.model';
import { Publisher } from '@benassa-de-glassa/node-utilities/dist/pub-sub/model/publisher.model';
import { StreamEndpointHandler, WebSocketRequest } from '../model/handlers';
import { map } from 'rxjs';

export class PubSubEventStreamEndpoint implements StreamEndpointHandler {
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
