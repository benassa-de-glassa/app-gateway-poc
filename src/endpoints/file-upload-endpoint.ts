import fs = require('fs');

import { of } from 'rxjs';
import { Publisher } from '@benassa-de-glassa/pub-sub';
import { PostEndpoint, Endpoint, ResponseType } from '../app-builder/express/model/handlers';

export class FileUploadEndpoint implements PostEndpoint {
  public constructor(private readonly publisher: Publisher) {}
  public get POST(): Endpoint {
    return {
      responseTypes: new Set([ResponseType.object]),
      handler: (request, _token, _logger) => {
        const file = request.files?.file;

        if (file) {
          fs.writeFileSync(file.name, file.data);
          this.publisher.publish({ name: file.name, size: file.size });
          return of({ payload: { name: file.name, size: file.size }, code: 200 });
        }
        return of({ payload: { message: 'No file uploaded' }, code: 400 });
      }
    };
  }
}
