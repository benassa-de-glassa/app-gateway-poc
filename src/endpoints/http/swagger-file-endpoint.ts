import { GetEndpoint, ResponseType } from '@benassa-de-glassa/servers';
import { map, of } from 'rxjs';

export class SwaggerFileEndpoint implements GetEndpoint {
  public constructor(private readonly swaggerFilePath: string) {}

  public get GET() {
    return {
      responseTypes: new Set([ResponseType.file]),
      handler: () => {
        return of(this.swaggerFilePath).pipe(map(path => ({ payload: path, code: 200 })));
      }
    };
  }
}
