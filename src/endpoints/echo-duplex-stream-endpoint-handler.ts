import { Subject } from 'rxjs';
import { StreamEndpointHandler, WebSocketRequest } from '../model/handlers.js';

export class BroadcastDuplexStreamHandlerEndpoint implements StreamEndpointHandler {
  public get streamHandler() {
    const broadcastMessage$ = new Subject<string>();
    const handleMessage = (request: WebSocketRequest) => {
      broadcastMessage$.next(request.message);
    };

    return { broadcastMessage$, handleMessage };
  }
}
