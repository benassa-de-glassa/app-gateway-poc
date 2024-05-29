import { AuthenticationToken, TokenVerifier } from '@benassa-de-glassa/servers';

import * as jose from 'jose';

export class SessionTokenDecodeVerifier implements TokenVerifier {
  public async verify(token: string): Promise<AuthenticationToken> {
    return jose.decodeJwt(token);
  }
}
