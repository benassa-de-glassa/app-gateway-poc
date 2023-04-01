import { interval, map } from 'rxjs';
import { StreamEndpointHandler, WebSocketRequest } from '../model/get-stream-handler.js';

export class FixedTimeIntervalResponseEndpoint implements StreamEndpointHandler {
  public streamHandler = {
    broadcastMessage$: interval(1000).pipe(map(() => Date())),
    handleMessage: (request: WebSocketRequest) => {
      console.warn(request);
    }
  };
}
