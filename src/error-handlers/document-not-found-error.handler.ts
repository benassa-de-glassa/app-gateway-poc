import { NotFoundError } from '@benassa-de-glassa/document-service';
import { Logger } from '@benassa-de-glassa/logger';
import { of } from 'rxjs';
import { ErrorHandler } from '@benassa-de-glassa/servers';
import { handleCorrectError } from './handle-correct-error';

export const DocumentNotFoundErrorHandler: ErrorHandler = (error: Error, logger: Logger) => {
  handleCorrectError<NotFoundError>(error, NotFoundError);
  logger.notice({ message: 'Handling error as 404', error: error });
  return of({ code: 404, payload: { message: error.message } });
};
