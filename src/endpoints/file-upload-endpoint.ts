import fs = require('fs');

import { Endpoint, PostEndpoint, ResponseType } from '@benassa-de-glassa/express-server';
import { of } from 'rxjs';
import { Publisher } from '@benassa-de-glassa/pub-sub';

export class FileUploadEndpoint implements PostEndpoint {
  public constructor(private readonly publisher: Publisher) {}
  public get post(): Endpoint {
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
