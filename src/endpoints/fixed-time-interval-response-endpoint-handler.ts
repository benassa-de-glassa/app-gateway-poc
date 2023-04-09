import { interval, map } from 'rxjs';
import { StreamEndpoint, WebSocketRequest } from '../model/handlers.js';

export class FixedTimeIntervalResponseEndpoint implements StreamEndpoint {
  public streamHandler = {
    broadcastMessage$: interval(1000).pipe(map(() => Date())),
    handleMessage: (request: WebSocketRequest) => {}
  };
}
