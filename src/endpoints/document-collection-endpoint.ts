import { IdentifiedEntity } from '@benassa-de-glassa/node-utilities/dist/models';
import { DocumentService } from '@benassa-de-glassa/node-utilities/dist/document-service/model/document-service.model';
import { EndpointResponse, GetEndpoint, PostEndpoint } from '../express/model/handlers';
import { EndpointRequest } from '../express/model/handlers';
import { Logger } from '@benassa-de-glassa/node-utilities/dist/logger/model';
import {
  ScimSyntaxTreeBuilder,
  ScimFilterStringTokenizer,
  ScimFilterConditionParser
} from '@benassa-de-glassa/node-utilities/dist/query/parser/scim';
import { IdentityAttributeNormalizer } from '@benassa-de-glassa/node-utilities/dist/query/parser/utilities/attribute-normalizers/identity-attribute-normalizer';
import { TrivialAttributePropertyOracle } from '@benassa-de-glassa/node-utilities/dist/query/parser/utilities/attribute-property-oracles/trivial-property-oracle';
import { SimpleValueParser } from '@benassa-de-glassa/node-utilities/dist/query/parser/utilities/value-parsers/simple-value-parser';

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
