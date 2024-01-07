import * as express from 'express';
import { ExpressHandler } from './express-handler';
import { ExpressHttpAdapter } from './express-http-adapter';

import { ExpressWebSocketAdapter } from '../express-ws-adapter';
import path = require('path');
import { Endpoint, DuplexStreamHandler } from './model/handlers';

export interface Endpoints {
  POST?: Endpoint;
  GET?: Endpoint;
  PATCH?: Endpoint;
  PUT?: Endpoint;
  DELETE?: Endpoint;
  stream?: DuplexStreamHandler;
}

export interface Route {
  root: string;
  endpoints: Endpoints[];
  middleware: ExpressHandler[];
}

export class RouterFactory {
  private readonly expressHttpAdapter: ExpressHttpAdapter;
  private readonly expressWsAdapter: ExpressWebSocketAdapter;

  public constructor() {
    this.expressHttpAdapter = new ExpressHttpAdapter();
    this.expressWsAdapter = new ExpressWebSocketAdapter();
  }

  public getFor(route: Route): express.Router {
    const router = express.Router();
    route.middleware.forEach(m => router.use(m));

    route.endpoints.forEach(endpoint => {
      const route = router.route('');
      const { POST, GET, PATCH, PUT, DELETE, stream } = endpoint;

      if (GET != null) {
        route.get(this.expressHttpAdapter.expressHandler(GET, endpoint));
      }
      if (POST != null) {
        route.post(this.expressHttpAdapter.expressHandler(POST, endpoint));
      }
      if (PATCH != null) {
        route.patch(this.expressHttpAdapter.expressHandler(PATCH, endpoint));
      }
      if (PUT != null) {
        route.put(this.expressHttpAdapter.expressHandler(PUT, endpoint));
      }
      if (DELETE != null) {
        route.delete(this.expressHttpAdapter.expressHandler(DELETE, endpoint));
      }
      if (stream != null) {
        router.use(this.expressWsAdapter.adapt(stream, endpoint));
      }
    });

    return router;
  }
}
