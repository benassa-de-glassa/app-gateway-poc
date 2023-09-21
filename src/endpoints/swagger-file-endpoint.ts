import { map, of } from 'rxjs';
import { GetEndpoint, ResponseType } from '@benassa-de-glassa/express-server';

export class SwaggerFileEndpoint implements GetEndpoint {
  public constructor(private readonly swaggerFilePath: string) {}

  public get get() {
    return {
      responseTypes: new Set([ResponseType.file]),
      handler: () => {
        return of(this.swaggerFilePath).pipe(map(path => ({ payload: path, code: 200 })));
      }
    };
  }
}
