import { interval, map } from 'rxjs';
import { StreamEndpoint, WebSocketRequest } from '../express/model/handlers';

export class FixedTimeIntervalResponseEndpoint implements StreamEndpoint {
  public streamHandler = {
    broadcastMessage$: interval(1000).pipe(map(() => Date())),
    handleMessage: (_request: WebSocketRequest) => {}
  };
}
