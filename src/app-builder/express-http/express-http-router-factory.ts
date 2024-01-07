import * as express from 'express';
import { ExpressHandler } from '../express-common/express-handler';
import { ExpressHttpAdapter } from './express-http-adapter';

import { Endpoint } from '../express-common/model/handlers';

export interface HttpEndpoints {
  POST?: Endpoint;
  GET?: Endpoint;
  PATCH?: Endpoint;
  PUT?: Endpoint;
  DELETE?: Endpoint;
}

export interface HttpRoute {
  root: string;
  endpoints: HttpEndpoints[];
  middleware: ExpressHandler[];
}

export class ExpressHttpRouterFactory {
  private readonly expressHttpAdapter: ExpressHttpAdapter = new ExpressHttpAdapter();

  public getFor(route: HttpRoute): express.Router {
    const router = express.Router();
    route.middleware.forEach(m => router.use(m));

    route.endpoints.forEach(endpoint => {
      const route = router.route('');
      const { POST, GET, PATCH, PUT, DELETE } = endpoint;

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
    });

    return router;
  }
}
