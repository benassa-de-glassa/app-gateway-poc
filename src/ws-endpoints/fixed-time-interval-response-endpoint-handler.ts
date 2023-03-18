import { interval, map } from 'rxjs';
import { EndpointRequest, Handler, WebSocketRequest } from '../model/get-stream-handler.js';

export class FixedTimeIntervalResponseEndpoint {
  public getHandler: Handler = async (request: WebSocketRequest) => {
    return { payload: null, code: 204, stream$: interval(10000).pipe(map(() => Date())) };
  };
}
