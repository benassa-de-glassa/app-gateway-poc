import { tap } from 'rxjs';
import { PubSubEndpoint } from './model/handlers';

export class PubSubAdapter {
  public adapt(
    handler: PubSubEndpoint,
    pathEndpoints?: {
      pubSubEndpoint?: PubSubEndpoint;
    }
  ) {
    handler.subscriber
      .subscribe()
      .pipe(
        tap((message: any) => {
          try {
            handler.pubSubMessageHandler.call(pathEndpoints, message);
          } catch (error) {
            return;
          }
        })
      )
      .subscribe();
  }
}
