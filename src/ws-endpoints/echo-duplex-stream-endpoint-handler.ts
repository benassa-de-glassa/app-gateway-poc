import { Subject } from 'rxjs';
import { StreamEndpointHandler, WebSocketRequest } from '../model/get-stream-handler.js';

export class BroadcastDuplexStreamHandlerEndpoint implements StreamEndpointHandler {
  public get streamHandler() {
    const sendMessage$ = new Subject<string>();
    const handleMessage = (request: WebSocketRequest) => {
      sendMessage$.next(request.message);
    };

    return { sendMessage$, handleMessage };
  }
}
