import { Subscriber } from '@benassa-de-glassa/node-utilities/dist/pub-sub/model/subscriber.model';
import { Publisher } from '@benassa-de-glassa/node-utilities/dist/pub-sub/model/publisher.model';
import { StreamEndpointHandler, WebSocketRequest } from '../model/get-stream-handler';

export class PubSubEventStreamEndpoint implements StreamEndpointHandler {
  public constructor(private readonly eventSubscriber: Subscriber, private readonly eventPublisher: Publisher) {}

  public get streamHandler() {
    const handleMessage = (request: WebSocketRequest) => {
      this.eventPublisher.publish(request.message);
    };

    return { broadcastMessage$: this.eventSubscriber.subscribe(), handleMessage };
  }
}
