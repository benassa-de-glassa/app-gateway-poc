import { DocumentSingleCreateService, DocumentStreamQueryService } from '@benassa-de-glassa/document-service';
import { Endpoint, EndpointRequest, GetEndpoint, ResponseType } from '@benassa-de-glassa/express-server';
import { Logger } from '@benassa-de-glassa/logger';
import { IdentifiedEntity } from '@benassa-de-glassa/models';
import {
  IdentityAttributeNormalizer,
  ScimFilterConditionParser,
  ScimFilterStringTokenizer,
  ScimSyntaxTreeBuilder,
  SimpleValueParser,
  TrivialAttributePropertyOracle
} from '@benassa-de-glassa/query';
import { faker } from '@faker-js/faker';

import { from, map } from 'rxjs';

export class DocumentCollectionStreamEndpoint<T extends IdentifiedEntity> implements GetEndpoint {
  public static readonly PATH = '/resources-stream';

  public constructor(
    private readonly documentService: DocumentSingleCreateService<T> & DocumentStreamQueryService<T>
  ) {}

  public get get() {
    return {
      responseTypes: new Set([ResponseType.eventStream]),
      handler: (request: EndpointRequest, _token: Record<string, unknown>, _logger: Logger) => {
        const filter: string = request.queryParameters.filter;

        const filterExpression = new ScimSyntaxTreeBuilder(
          new ScimFilterStringTokenizer(),
          new ScimFilterConditionParser(
            new SimpleValueParser(),
            new IdentityAttributeNormalizer(),
            new TrivialAttributePropertyOracle()
          )
        ).build(filter);

        return this.documentService
          .query$(filterExpression, { ...request.queryParameters })
          .pipe(map(response => ({ payload: response, code: 200 })));
      }
    };
  }

  public get post(): Endpoint {
    return {
      responseTypes: new Set([ResponseType.object]),
      handler: (_request: EndpointRequest, _token: Record<string, unknown>, _logger: Logger) => {
        const fakeUser: any = {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          gender: faker.person.gender(),
          bio: faker.person.bio(),
          birthDate: faker.date.past().toISOString(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          address: {
            street: faker.location.street(),
            city: faker.location.city(),
            state: faker.location.state(),
            zipCode: faker.location.zipCode(),
            country: faker.location.country(),
            countryCode: faker.location.countryCode()
          }
        };

        return from(this.documentService.create(fakeUser)).pipe(map(id => ({ payload: id, code: 200 })));
      }
    };
  }
}
