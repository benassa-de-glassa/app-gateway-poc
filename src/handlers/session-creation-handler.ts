import { Cache } from '@benassa-de-glassa/cache';

import { DateService, IdGenerator } from '@benassa-de-glassa/utilities';

export class SessionCreationHandler {
  public constructor(
    private readonly cache: Cache<string>,
    private readonly sessionIdGenerator: IdGenerator,
    private readonly dateService: DateService
  ) {}

  public async handleSessionCreation(): Promise<string> {
    const sessionId = this.sessionIdGenerator.generatedId();
    const timestamp = this.dateService.nowIsoString();
    await this.cache.set(sessionId, timestamp);
    return sessionId;
  }
}
