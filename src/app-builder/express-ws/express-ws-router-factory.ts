import * as express from 'express';

import { DuplexStreamHandler } from '../express-common/model/handlers';
import { ExpressWebSocketAdapter } from './express-ws-adapter';
import { ExpressHandler } from '../express-common/express-handler';

export interface WsEndpoints {
  stream?: DuplexStreamHandler;
}

export interface WsRoute {
  root: string;
  endpoints: WsEndpoints[];
  middleware: ExpressHandler[];
}

export class ExpressWsRouterFactory {
  private readonly expressWsAdapter: ExpressWebSocketAdapter = new ExpressWebSocketAdapter();

  public constructor() {}

  public getFor(route: WsRoute): express.Router {
    const router = express.Router();
    route.middleware.forEach(m => router.use(m));

    route.endpoints.forEach(endpoint => {
      const { stream } = endpoint;

      if (stream != null) {
        router.use(this.expressWsAdapter.adapt(stream, endpoint));
      }
    });

    return router;
  }
}
