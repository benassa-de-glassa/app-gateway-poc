import { BaseError } from '@benassa-de-glassa/models';
export class AuthenticationError extends BaseError {
  public constructor(message: string) {
    super(message);
  }
}
