import * as express from 'express';
import { HttpHandler, DuplexStreamHandler, PubSubEndpoint } from './model/handlers';
import { ExpressHttpAdapter } from './express-http-adapter';
import { ExpressWebSocketAdapter } from './express-ws-adapter';
import { ExpressHandler } from './express-handler';
import { PubSubAdapter } from './express-pubsub-adapter';

export interface Endpoints {
  [endpoint: string]: {
    postHandler?: HttpHandler;
    getHandler?: HttpHandler;
    patchHandler?: HttpHandler;
    putHandler?: HttpHandler;
    deleteHandler?: HttpHandler;
    streamHandler?: DuplexStreamHandler;
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
        const { postHandler, getHandler, patchHandler, putHandler, deleteHandler, pubSubEndpoint, streamHandler } =
          handler;

        if (getHandler != null) {
          route.get(this.expressHttpAdapter.expressHandler(getHandler, handler));
        }
        if (postHandler != null) {
          route.post(this.expressHttpAdapter.expressHandler(postHandler, handler));
        }
        if (patchHandler != null) {
          route.patch(this.expressHttpAdapter.expressHandler(patchHandler, handler));
        }
        if (putHandler != null) {
          route.put(this.expressHttpAdapter.expressHandler(putHandler, handler));
        }
        if (deleteHandler != null) {
          route.delete(this.expressHttpAdapter.expressHandler(deleteHandler, handler));
        }
        if (pubSubEndpoint != null) {
          this.expressPubSubAdapter.adapt(pubSubEndpoint, handler);
        }
        if (streamHandler != null) {
          router.use(endpoint, this.expressWsAdapter.adapt(streamHandler, handler));
        }
      });
    });

    return router;
  }
}
