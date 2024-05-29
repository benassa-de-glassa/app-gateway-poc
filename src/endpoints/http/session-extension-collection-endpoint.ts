import { RedisClientType } from 'redis';
import { from, map } from 'rxjs';

import { Cache, RedisCache } from '@benassa-de-glassa/cache';
import { Endpoint, PostEndpoint, ResponseType } from '@benassa-de-glassa/servers';
import { CurrentDateService } from '@benassa-de-glassa/utilities';
import { SessionTokenDecodeVerifier } from '../../authentication/token-verifiers/session-token-decode-verifier';
import { SessionExtensionHandler } from '../../handlers/session-extension-handler';

export class SessionExtensionCollectionEndpoint implements PostEndpoint {
  public constructor(private readonly redisClient: RedisClientType) {}

  get POST(): Endpoint {
    return {
      responseTypes: new Set([ResponseType.object]),
      handler: request => {
        const cache: Cache<string> = new RedisCache<string>(this.redisClient);

        const handler = new SessionExtensionHandler(cache, new SessionTokenDecodeVerifier(), new CurrentDateService());

        const authorizationHeader = request.lowercaseHeaders.authorization;
        if (typeof authorizationHeader !== 'string') {
          return from(Promise.reject(new Error('Invalid token')));
        }
        const token = authorizationHeader.split(' ')[1];
        return from(handler.verify(token)).pipe(map(() => ({ payload: {}, code: 200 })));
      }
    };
  }
}
