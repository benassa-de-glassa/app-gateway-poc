import { Subject } from 'rxjs';
import { StreamEndpoint, WebSocketRequest } from '../express/model/handlers';

export class BroadcastDuplexStreamHandlerEndpoint implements StreamEndpoint {
  public get streamHandler() {
    const broadcastMessage$ = new Subject<string>();
    const handleMessage = (request: WebSocketRequest) => {
      broadcastMessage$.next(request.message);
    };

    return { broadcastMessage$, handleMessage };
  }
}
