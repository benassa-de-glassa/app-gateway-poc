import { map, of } from 'rxjs';

import { IdGenerator } from '@benassa-de-glassa/utilities';
import { redocHtmlTemplate } from '../../docs/redoc-template';
import { GetEndpoint, ResponseType } from '@benassa-de-glassa/servers';

export class RedocEndpoint implements GetEndpoint {
  public constructor(
    private readonly title: string,
    private readonly swaggerFileUrl: string,
    private readonly nonceGenerator: IdGenerator
  ) {}

  public get GET() {
    return {
      responseTypes: new Set([ResponseType.html]),
      handler: (_request: any) => {
        const nonce = this.nonceGenerator.generatedId();
        const html = redocHtmlTemplate({
          title: this.title,
          specUrl: this.swaggerFileUrl,
          nonce,
          redocOptions: {}
        });

        const response$ = of(html);
        return response$.pipe(
          map(response => ({
            payload: response,
            code: 200,
            headers: { ['Content-Security-Policy']: `script-src unpkg.com 'nonce-${nonce}' 'strict-dynamic';` }
          }))
        );
      }
    };
  }
}
