import * as express from 'express';
import { ExpressHandler } from './express-handler';
import { ExpressHttpAdapter } from './express-http-adapter';
import { PubSubAdapter } from './express-pubsub-adapter';
import { ExpressWebSocketAdapter } from './express-ws-adapter';
import { DuplexStreamHandler, Endpoint, PubSubEndpoint } from './model/handlers';

export interface Endpoints {
  [endpoint: string]: {
    POST?: Endpoint;
    GET?: Endpoint;
    PATCH?: Endpoint;
    PUT?: Endpoint;
    DELETE?: Endpoint;
    stream?: DuplexStreamHandler;
    pubSubEndpoint?: PubSubEndpoint;
  };
}

export interface Route {
  root: string;
  endpoints: Endpoints[];
  middleware: ExpressHandler[];
}

export class RouterFactory {
  private readonly expressHttpAdapter: ExpressHttpAdapter;
  private readonly expressWsAdapter: ExpressWebSocketAdapter;
  private readonly expressPubSubAdapter: PubSubAdapter;

  public constructor() {
    this.expressHttpAdapter = new ExpressHttpAdapter();
    this.expressWsAdapter = new ExpressWebSocketAdapter();
    this.expressPubSubAdapter = new PubSubAdapter();
  }

  public getFor(route: Route): express.Router {
    const router = express.Router();
    route.middleware.forEach(m => router.use(m));

    route.endpoints.forEach(endpoints => {
      Object.entries(endpoints).forEach(([endpoint, handler]) => {
        const route = router.route(endpoint);
        const { POST, GET, PATCH, PUT, DELETE, pubSubEndpoint, stream } = handler;

        if (GET != null) {
          route.get(this.expressHttpAdapter.expressHandler(GET, handler));
        }
        if (POST != null) {
          route.post(this.expressHttpAdapter.expressHandler(POST, handler));
        }
        if (PATCH != null) {
          route.patch(this.expressHttpAdapter.expressHandler(PATCH, handler));
        }
        if (PUT != null) {
          route.put(this.expressHttpAdapter.expressHandler(PUT, handler));
        }
        if (DELETE != null) {
          route.delete(this.expressHttpAdapter.expressHandler(DELETE, handler));
        }
        if (pubSubEndpoint != null) {
          this.expressPubSubAdapter.adapt(pubSubEndpoint, handler);
        }
        if (stream != null) {
          router.use(endpoint, this.expressWsAdapter.adapt(stream, handler));
        }
      });
    });

    return router;
  }
}
