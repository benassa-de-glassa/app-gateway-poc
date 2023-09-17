import { AuthenticationToken, TokenVerifier } from '@benassa-de-glassa/express-server';

export class NoopTokenVerifier implements TokenVerifier {
  public async verify(_token: string): Promise<AuthenticationToken> {
    return {};
  }
}
