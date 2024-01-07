import { map, of } from 'rxjs';
import { GetEndpoint, ResponseType } from '../app-builder/model/handlers';

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
