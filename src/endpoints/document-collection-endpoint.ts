import { IdentifiedEntity } from '@benassa-de-glassa/models';
import { EndpointResponse, GetEndpoint, PostEndpoint } from '../express/model/handlers';
import { EndpointRequest } from '../express/model/handlers';
import { Logger } from '@benassa-de-glassa/logger';
import { ScimSyntaxTreeBuilder, ScimFilterStringTokenizer, ScimFilterConditionParser } from '@benassa-de-glassa/query';
import { IdentityAttributeNormalizer } from '@benassa-de-glassa/query';
import { TrivialAttributePropertyOracle } from '@benassa-de-glassa/query';
import { SimpleValueParser } from '@benassa-de-glassa/query';
import { DocumentService } from '@benassa-de-glassa/document-service';

export class DocumentCollectionEndpoint<Document extends IdentifiedEntity> implements GetEndpoint, PostEndpoint {
  public constructor(private readonly documentService: DocumentService<Document>) {}

  public async getHandler(
    request: EndpointRequest,
    _token: Record<string, unknown>,
    _logger: Logger
  ): Promise<EndpointResponse> {
    const filter: string = request.queryParameters.filter;

    const filterExpression = new ScimSyntaxTreeBuilder(
      new ScimFilterStringTokenizer(),
      new ScimFilterConditionParser(
        new SimpleValueParser(),
        new IdentityAttributeNormalizer(),
        new TrivialAttributePropertyOracle()
      )
    ).build(filter);

    return {
      payload: await this.documentService.query(filterExpression, request.queryParameters),
      code: 200
    };
  }

  public async postHandler(
    request: EndpointRequest,
    _token: Record<string, unknown>,
    _logger: Logger
  ): Promise<EndpointResponse> {
    return {
      payload: await this.documentService.create(request.body),
      code: 200
    };
  }
}
