import { AuthenticationToken, TokenVerifier } from '@benassa-de-glassa/servers';

export class NoopTokenVerifier implements TokenVerifier {
  public async verify(_token: string): Promise<AuthenticationToken> {
    return {};
  }
}
