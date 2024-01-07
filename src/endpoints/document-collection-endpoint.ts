import { IdentifiedEntity } from '@benassa-de-glassa/models';

import { DocumentService } from '@benassa-de-glassa/document-service';

import { Logger } from '@benassa-de-glassa/logger';
import {
  IdentityAttributeNormalizer,
  ScimFilterConditionParser,
  ScimFilterStringTokenizer,
  ScimSyntaxTreeBuilder,
  SimpleValueParser,
  TrivialAttributePropertyOracle
} from '@benassa-de-glassa/query';
import { Observable, from, map } from 'rxjs';
import {
  GetEndpoint,
  PostEndpoint,
  ResponseType,
  EndpointRequest,
  EndpointResponse
} from '../app-builder/model/handlers';

export class DocumentCollectionEndpoint<Document extends IdentifiedEntity> implements GetEndpoint, PostEndpoint {
  public constructor(private readonly documentService: DocumentService<Document>) {}

  public get GET() {
    return {
      responseTypes: new Set([ResponseType.object, ResponseType.eventStream]),
      handler: (
        request: EndpointRequest,
        _token: Record<string, unknown>,
        _logger: Logger
      ): Observable<EndpointResponse> => {
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
    };
  }

  public get POST() {
    return {
      responseTypes: new Set([ResponseType.object]),
      handler: (
        request: EndpointRequest,
        _token: Record<string, unknown>,
        _logger: Logger
      ): Observable<EndpointResponse> => {
        const response$ = from(this.documentService.create(request.body));
        return response$.pipe(map(response => ({ payload: response, code: 201 })));
      }
    };
  }
}
