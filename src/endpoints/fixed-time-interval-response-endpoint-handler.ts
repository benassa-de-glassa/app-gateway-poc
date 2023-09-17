import { StreamEndpoint, WebSocketRequest } from '@benassa-de-glassa/express-server';
import { interval, map } from 'rxjs';

export class FixedTimeIntervalResponseEndpoint implements StreamEndpoint {
  public streamHandler = {
    broadcastMessage$: interval(1000).pipe(map(() => Date())),
    handleMessage: (_request: WebSocketRequest) => {}
  };
}
