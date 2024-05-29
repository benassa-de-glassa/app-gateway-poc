import { Cache } from '@benassa-de-glassa/cache';
import { DateService } from '@benassa-de-glassa/utilities';

import { TokenVerifier } from '../authentication/token-verifiers/token-verifier';
import { SessionExpirationVerifier } from '../utilities/session-expiration-verifier';
import { validateSessionToken } from '../utilities/session-token-validator';

export class SessionVerificationHandler {
  public constructor(
    private readonly baseTokenVerifier: TokenVerifier,
    private readonly cache: Cache<string>,
    private readonly dateService: DateService
  ) {}

  public async handleSessionVerification(token: string): Promise<void> {
    const verified = await this.baseTokenVerifier.verify(token);
    validateSessionToken(verified);

    const { sessionId, activityExtensionInMs } = verified.sessionClaims;
    const sessionVerifier = new SessionExpirationVerifier(this.cache, this.dateService, activityExtensionInMs);

    await sessionVerifier.verify(sessionId);
  }
}
