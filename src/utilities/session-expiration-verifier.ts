import { Cache } from '@benassa-de-glassa/cache';
import { AuthenticationError } from '../errors/authentication-error';
import { DateService } from '@benassa-de-glassa/utilities';

export class SessionExpirationVerifier {
  public constructor(
    private readonly sessionCache: Cache<string>,
    private readonly dateService: DateService,
    private readonly activityExtensionInMs: number
  ) {}
  public async verify(sessionId: string): Promise<void> {
    const lastActive = await this.sessionCache.get(sessionId);

    if (lastActive == null) {
      throw new AuthenticationError('No session found for token');
    }

    const isSessionExpired =
      new Date(lastActive).getTime() + this.activityExtensionInMs < this.dateService.now().getTime();

    if (isSessionExpired) {
      throw new AuthenticationError('Session expired');
    }
  }
}
