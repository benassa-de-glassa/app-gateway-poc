import { of } from 'rxjs';

import { BaseError } from '@benassa-de-glassa/models';
import { ErrorHandler } from '@benassa-de-glassa/servers';
import { Logger } from '@benassa-de-glassa/logger';

import { handleCorrectError } from './handle-correct-error';
export class AuthenticationError extends BaseError {
  public constructor(message: string) {
    super(message);
  }
}

export const AuthenticationErrorHandler: ErrorHandler = (error: Error, logger: Logger) => {
  handleCorrectError<AuthenticationError>(error, AuthenticationError);
  logger.notice({ message: 'Handling error as 401', error: error });
  return of({ code: 401, payload: { message: error.message } });
};
