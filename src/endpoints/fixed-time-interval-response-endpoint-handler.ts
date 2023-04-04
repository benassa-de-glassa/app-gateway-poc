import { interval, map } from 'rxjs';
import { StreamEndpointHandler, WebSocketRequest } from '../model/handlers.js';

export class FixedTimeIntervalResponseEndpoint implements StreamEndpointHandler {
  public streamHandler = {
    broadcastMessage$: interval(1000).pipe(map(() => Date())),
    handleMessage: (request: WebSocketRequest) => {}
  };
}
