import { StreamEndpoint, WebSocketRequest } from '@benassa-de-glassa/express-server';
import { Subject } from 'rxjs';

export class BroadcastDuplexStreamHandlerEndpoint implements StreamEndpoint {
  public get streamHandler() {
    const broadcastMessage$ = new Subject<string>();
    const handleMessage = (request: WebSocketRequest) => {
      broadcastMessage$.next(request.message);
    };

    return { broadcastMessage$, handleMessage };
  }
}
