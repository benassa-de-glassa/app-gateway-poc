import { AuthenticationToken, TokenVerifier } from './token-verifier';

export class NoopTokenVerifier implements TokenVerifier {
  public async verify(_token: string): Promise<AuthenticationToken> {
    return {};
  }
}
