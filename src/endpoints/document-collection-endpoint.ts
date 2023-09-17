import { IdentifiedEntity } from '@benassa-de-glassa/models';

import { Logger } from '@benassa-de-glassa/logger';
import { ScimSyntaxTreeBuilder, ScimFilterStringTokenizer, ScimFilterConditionParser } from '@benassa-de-glassa/query';
import { IdentityAttributeNormalizer } from '@benassa-de-glassa/query';
import { TrivialAttributePropertyOracle } from '@benassa-de-glassa/query';
import { SimpleValueParser } from '@benassa-de-glassa/query';
import { DocumentService } from '@benassa-de-glassa/document-service';
import { Observable, from, map } from 'rxjs';
import { GetEndpoint, PostEndpoint, EndpointRequest, EndpointResponse } from '@benassa-de-glassa/express-server';

export class DocumentCollectionEndpoint<Document extends IdentifiedEntity> implements GetEndpoint, PostEndpoint {
  public constructor(private readonly documentService: DocumentService<Document>) {}

  public getHandler(
    request: EndpointRequest,
    _token: Record<string, unknown>,
    _logger: Logger
  ): Observable<EndpointResponse> {
    const filter: string = request.queryParameters.filter;

    const filterExpression = new ScimSyntaxTreeBuilder(
      new ScimFilterStringTokenizer(),
      new ScimFilterConditionParser(
        new SimpleValueParser(),
        new IdentityAttributeNormalizer(),
        new TrivialAttributePropertyOracle()
      )
    ).build(filter);

    const response$ = from(this.documentService.query(filterExpression, request.queryParameters));

    return response$.pipe(map(response => ({ payload: response, code: 200 })));
  }

  public postHandler(
    request: EndpointRequest,
    _token: Record<string, unknown>,
    _logger: Logger
  ): Observable<EndpointResponse> {
    _logger.info(request.body);
    const response$ = from(this.documentService.create(request.body));
    return response$.pipe(map(response => ({ payload: response, code: 200 })));
  }
}
