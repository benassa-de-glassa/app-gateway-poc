import { RedisClientType } from 'redis';

import { Cache, RedisCache } from '@benassa-de-glassa/cache';
import { Endpoint, PostEndpoint, ResponseType } from '@benassa-de-glassa/servers';
import { CurrentDateService } from '@benassa-de-glassa/utilities';
import { from, map } from 'rxjs';
import { SessionTokenDecodeVerifier } from '../../authentication/token-verifiers/session-token-decode-verifier';
import { TokenVerifier } from '../../authentication/token-verifiers/token-verifier';
import { SessionVerificationHandler } from '../../handlers/session-verification-handler';

export class VerifyEndpoint implements PostEndpoint {
  public constructor(private readonly redisClient: RedisClientType) {}

  get POST(): Endpoint {
    return {
      responseTypes: new Set([ResponseType.object]),
      handler: (request, _response, _logger) => {
        const cache: Cache<string> = new RedisCache<string>(this.redisClient);
        const baseTokenVerifier: TokenVerifier = new SessionTokenDecodeVerifier();

        const handler = new SessionVerificationHandler(baseTokenVerifier, cache, new CurrentDateService());
        const authorizationHeader = request.lowercaseHeaders.authorization;
        if (typeof authorizationHeader !== 'string') {
          return from(Promise.reject(new Error('Invalid token')));
        }
        const token = authorizationHeader.split(' ')[1];
        return from(handler.verifySession(token)).pipe(map(token => ({ payload: token, code: 200 })));
      }
    };
  }
}
