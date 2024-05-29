import { RedisClientType } from 'redis';

import { Endpoint, PostEndpoint, ResponseType } from '@benassa-de-glassa/servers';
import { Cache, RedisCache } from '@benassa-de-glassa/cache';
import { SessionExpirationVerifier } from '../../utilities/session-expiration-verifier';
import { SessionTokenDecodeVerifier } from '../../authentication/token-verifiers/session-token-decode-verifier';
import { TokenVerifier } from '../../authentication/token-verifiers/token-verifier';
import { from, map } from 'rxjs';

export class VerifyEndpoint implements PostEndpoint {
  public constructor(private readonly redisClient: RedisClientType) {}

  get POST(): Endpoint {
    return {
      responseTypes: new Set([ResponseType.object]),
      handler: (request, _response, _logger) => {
        const cache: Cache<string> = new RedisCache<string>(this.redisClient);
        const baseTokenVerifier: TokenVerifier = new SessionTokenDecodeVerifier();
        const verifier = new SessionExpirationVerifier(cache, baseTokenVerifier);
        return from(verifier.verify(request.body.token)).pipe(map(token => ({ payload: token, code: 200 })));
      }
    };
  }
}
