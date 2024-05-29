import { Cache } from '@benassa-de-glassa/cache';
import { TokenVerifier } from '@benassa-de-glassa/servers';
import { AuthenticationError } from '../errors/authentication-error';
import { SessionExpirationVerifier } from '../utilities/session-expiration-verifier';
import { validateSessionToken } from '../utilities/session-token-validator';
import { DateService } from '@benassa-de-glassa/utilities';

export class SessionExtensionHandler {
  public constructor(
    private readonly cache: Cache<string>,
    private readonly baseTokenVerifier: TokenVerifier,
    private readonly dateService: DateService
  ) {}
  public async verify(token: string): Promise<void> {
    try {
      const verified = await this.baseTokenVerifier.verify(token);
      validateSessionToken(verified);
      const { sessionId, activityExtensionInMs } = verified.sessionClaims;

      const sessionVerificationHandler = new SessionExpirationVerifier(
        this.cache,
        this.dateService,
        activityExtensionInMs
      );
      await sessionVerificationHandler.verify(sessionId);

      await this.extendSessionLifetime(sessionId);
    } catch (error) {
      await this.cache.delete(token);
      throw new AuthenticationError('Invalid token');
    }
  }

  private async extendSessionLifetime(sessionId: string) {
    await this.cache.set(sessionId, this.dateService.nowIsoString());
  }
}
