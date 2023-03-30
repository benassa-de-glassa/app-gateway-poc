import urljoin from 'url-join';

import express from 'express';

import { ExpressHttpHandler } from '../express-websocket/express-ws-adapter.js';
import { Endpoints, Route, RouterFactory } from './router-factory.js';

interface EndpointCollection {
  [consumer: string]: {
    [prefix: string]: { [versionTag: string]: { endpoints: Endpoints[]; middleware: ExpressHttpHandler[] } };
  };
}

enum Consumer {
  app = 'app',
  internal = 'internal',
  public = 'public',
  pubsub = 'pubsub'
}

export class ExpressTinyWsAppBuilder {
  private readonly endpoints: EndpointCollection = {};
  private readonly routerFactory = new RouterFactory();

  private readonly defaultPrefix = {
    [Consumer.app]: '',
    [Consumer.internal]: '',
    [Consumer.public]: '',
    [Consumer.pubsub]: ''
  };
  private readonly defaultMiddleware = {
    [Consumer.internal]: [],
    [Consumer.app]: [],
    [Consumer.public]: [],
    [Consumer.pubsub]: []
  };
  public build(): express.Application {
    const app = express();

    this.setupContentRoutes(app);

    return app;
  }

  public withAppEndpoints(versionTag: string, endpoints: Endpoints): ExpressTinyWsAppBuilder {
    const consumer = Consumer.app;
    return this.withDefaultRoute(consumer, versionTag).withEndpoints(
      consumer,
      this.defaultPrefix[consumer],
      versionTag,
      endpoints
    );
  }

  private withDefaultRoute(consumer: Consumer, versionTag: string): ExpressTinyWsAppBuilder {
    const prefix = this.defaultPrefix[consumer];
    if (this.endpoints[consumer]?.[prefix]?.[versionTag] != null) {
      return this;
    }
    return this.withRoute(consumer, prefix, versionTag, this.defaultMiddleware[consumer]);
  }

  private withEndpoints(
    consumer: Consumer,
    prefix: string,
    versionTag: string,
    endpoints: Endpoints
  ): ExpressTinyWsAppBuilder {
    const route = this.endpoints[consumer]?.[prefix]?.[versionTag];
    if (route == null) {
      throw new Error(`Missing route ${consumer} ${prefix} ${versionTag}`);
    }
    this.validateEndpoints(endpoints);
    route.endpoints.push(endpoints);
    return this;
  }

  private withRoute(
    consumer: Consumer,
    prefix: string,
    versionTag: string,
    middleware: ExpressHttpHandler[]
  ): ExpressTinyWsAppBuilder {
    const route = this.endpoints[consumer]?.[prefix]?.[versionTag];
    if (route != null) {
      throw new Error(`Route ${consumer} ${prefix} ${versionTag} already created`);
    }
    this.endpoints[consumer] = this.endpoints[consumer] ?? {};
    const consumerEndpoint = this.endpoints[consumer];
    consumerEndpoint[prefix] = consumerEndpoint[prefix] ?? {};
    const prefixEndpoint = consumerEndpoint[prefix];
    prefixEndpoint[versionTag] = prefixEndpoint[versionTag] ?? { endpoints: [], middleware: middleware };
    return this;
  }

  private setupContentRoutes(app: express.Application): void {
    Object.entries(this.endpoints).forEach(([consumer, consumerEndpoints]) => {
      Object.entries(consumerEndpoints).forEach(([prefix, prefixEndpoints]) => {
        Object.entries(prefixEndpoints).forEach(([versionTag, { endpoints, middleware }]) => {
          this.setupRoute(app, {
            root: urljoin('/', consumer, prefix, versionTag),
            endpoints,
            middleware
          });
        });
      });
    });
  }

  private setupRoute(app: express.Application, route: Route): void {
    const router = this.routerFactory.getFor(route);
    app.use(route.root, router);
  }
  private validateEndpoints(endpoints: Endpoints): void {
    Object.keys(endpoints).forEach(e => {
      if (e.length > 0 && e[0] !== '/') {
        throw new Error('Endpoints have to start with a dash');
      }
    });
  }
}
