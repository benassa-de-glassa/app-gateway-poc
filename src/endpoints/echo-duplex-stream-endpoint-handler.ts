import { Subject } from 'rxjs';
import { StreamEndpoint, WebSocketRequest } from '../app-builder/model/handlers';

export class BroadcastDuplexStreamHandlerEndpoint implements StreamEndpoint {
  public get stream() {
    const broadcastMessage$ = new Subject<string>();
    const handleMessage = (request: WebSocketRequest) => {
      broadcastMessage$.next(request.message);
    };

    return { broadcastMessage$, handleMessage };
  }
}
