import urljoin from 'url-join';

import express from 'express';

import { Endpoints, Route, RouterFactory } from './router-factory.js';
import { ExpressHandler } from './express-handler.js';

interface EndpointCollection {
  [consumer: string]: {
    [prefix: string]: { [versionTag: string]: { endpoints: Endpoints[]; middleware: ExpressHandler[] } };
  };
}

enum Consumer {
  app = 'app',
  internal = 'internal',
  public = 'public'
}

export class ExpressAppBuilder {
  private readonly endpoints: EndpointCollection = {};
  private readonly routerFactory = new RouterFactory('');

  private readonly defaultPrefix = {
    [Consumer.app]: '',
    [Consumer.internal]: '',
    [Consumer.public]: ''
  };
  private readonly defaultMiddleware: { [key in Consumer]: ExpressHandler[] } = {
    [Consumer.internal]: [],
    [Consumer.app]: [],
    [Consumer.public]: []
  };

  public build(): express.Application {
    const app = express();

    this.setupContentRoutes(app);

    return app;
  }

  public withAppEndpoints(versionTag: string, endpoints: Endpoints): ExpressAppBuilder {
    const consumer = Consumer.app;
    return this.withDefaultRoute(consumer, versionTag).withEndpoints(
      consumer,
      this.defaultPrefix[consumer],
      versionTag,
      endpoints
    );
  }

  public withInternalEndpoints(versionTag: string, endpoints: Endpoints): ExpressAppBuilder {
    const consumer = Consumer.internal;
    return this.withDefaultRoute(consumer, versionTag).withEndpoints(
      consumer,
      this.defaultPrefix[consumer],
      versionTag,
      endpoints
    );
  }

  public withPublicEndpoints(versionTag: string, endpoints: Endpoints): ExpressAppBuilder {
    const consumer = Consumer.public;
    return this.withDefaultRoute(consumer, versionTag).withEndpoints(
      consumer,
      this.defaultPrefix[consumer],
      versionTag,
      endpoints
    );
  }

  private withDefaultRoute(consumer: Consumer, versionTag: string): ExpressAppBuilder {
    const prefix = this.defaultPrefix[consumer];
    if (this.endpoints[consumer]?.[prefix]?.[versionTag] != null) {
      return this;
    }
    return this.withRoute(consumer, prefix, versionTag, this.defaultMiddleware[consumer]);
  }

  public withPublicRoute(prefix: string, versionTag: string, middleware: ExpressHandler[]): ExpressAppBuilder {
    return this.withRoute(Consumer.public, prefix, versionTag, middleware);
  }

  public withPublicRouteEndpoints(prefix: string, versionTag: string, endpoints: Endpoints): ExpressAppBuilder {
    return this.withEndpoints(Consumer.public, prefix, versionTag, endpoints);
  }

  public withAppRoute(prefix: string, versionTag: string, middleware: ExpressHandler[]): ExpressAppBuilder {
    return this.withRoute(Consumer.app, prefix, versionTag, middleware);
  }

  public withAppRouteEndpoints(prefix: string, versionTag: string, endpoints: Endpoints): ExpressAppBuilder {
    return this.withEndpoints(Consumer.app, prefix, versionTag, endpoints);
  }

  public withInternalRoute(prefix: string, versionTag: string, middleware: ExpressHandler[]): ExpressAppBuilder {
    return this.withRoute(Consumer.internal, prefix, versionTag, middleware);
  }

  public withInternalRouteEndpoints(prefix: string, versionTag: string, endpoints: Endpoints): ExpressAppBuilder {
    return this.withEndpoints(Consumer.internal, prefix, versionTag, endpoints);
  }

  private withEndpoints(
    consumer: Consumer,
    prefix: string,
    versionTag: string,
    endpoints: Endpoints
  ): ExpressAppBuilder {
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
    middleware: ExpressHandler[]
  ): ExpressAppBuilder {
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
