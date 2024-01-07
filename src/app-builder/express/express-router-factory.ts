import * as express from 'express';
import { ExpressHandler } from './express-handler';
import { ExpressHttpAdapter } from './express-http-adapter';

import { ExpressWebSocketAdapter } from '../express-ws-adapter';
import { DuplexStreamHandler, Endpoint } from '../model/handlers';

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

    const expressRoute = router.route('');

    route.endpoints.forEach(endpoint => {
      const { POST, GET, PATCH, PUT, DELETE, stream } = endpoint;

      if (GET != null) {
        expressRoute.get(this.expressHttpAdapter.expressHandler(GET, endpoint));
      }
      if (POST != null) {
        expressRoute.post(this.expressHttpAdapter.expressHandler(POST, endpoint));
      }
      if (PATCH != null) {
        expressRoute.patch(this.expressHttpAdapter.expressHandler(PATCH, endpoint));
      }
      if (PUT != null) {
        expressRoute.put(this.expressHttpAdapter.expressHandler(PUT, endpoint));
      }
      if (DELETE != null) {
        expressRoute.delete(this.expressHttpAdapter.expressHandler(DELETE, endpoint));
      }
      if (stream != null) {
        router.use(route.root, this.expressWsAdapter.adapt(stream, endpoint));
      }
    });

    return router;
  }
}
