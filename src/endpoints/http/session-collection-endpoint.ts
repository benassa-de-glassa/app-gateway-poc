import { RedisClientType } from 'redis';
import { from, map } from 'rxjs';

import { Endpoint, PostEndpoint, ResponseType } from '@benassa-de-glassa/servers';
import { Cache, RedisCache } from '@benassa-de-glassa/cache';
import { CurrentDateService, UUIDv4IdGenerator } from '@benassa-de-glassa/utilities';

import { SessionCreationHandler } from '../../handlers/session-creation-handler';

export class SessionCollectionEndpoint implements PostEndpoint {
  public constructor(private readonly redisClient: RedisClientType) {}

  get POST(): Endpoint {
    return {
      responseTypes: new Set([ResponseType.object]),
      handler: () => {
        const cache: Cache<string> = new RedisCache<string>(this.redisClient);
        const sessionIdGenerator = new UUIDv4IdGenerator();
        const dateService = new CurrentDateService();
        const handler = new SessionCreationHandler(cache, sessionIdGenerator, dateService);

        return from(handler.handleSessionCreation()).pipe(map(sessionId => ({ payload: { sessionId }, code: 201 })));
      }
    };
  }
}
