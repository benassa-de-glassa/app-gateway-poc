import { IdentifiedEntity } from '@benassa-de-glassa/models';
import { DocumentService } from '@benassa-de-glassa/document-service';

import { Logger } from '@benassa-de-glassa/logger';
import { from, map } from 'rxjs';
import {
  DeleteEndpoint,
  EndpointRequest,
  GetEndpoint,
  PatchEndpoint,
  PutEndpoint,
  ResponseType
} from '@benassa-de-glassa/express-server';

export class DocumentResourceEndpoint<Document extends IdentifiedEntity>
  implements GetEndpoint, PutEndpoint, PatchEndpoint, DeleteEndpoint
{
  public constructor(private readonly documentService: DocumentService<Document>) {}

  public get get() {
    return {
      responseTypes: new Set([ResponseType.object]),
      handler: (request: EndpointRequest, _token: Record<string, unknown>, _logger: Logger) => {
        const response$ = from(this.documentService.read(request.urlParameters.resourceId));
        return response$.pipe(map(response => ({ payload: response, code: 200 })));
      }
    };
  }

  public get patch() {
    return {
      responseTypes: new Set([ResponseType.object]),
      handler: (request: EndpointRequest, _token: Record<string, unknown>, _logger: Logger) => {
        const response$ = from(this.documentService.update(request.urlParameters.resourceId, request.body));
        return response$.pipe(map(response => ({ payload: response, code: 200 })));
      }
    };
  }

  public get put() {
    return {
      responseTypes: new Set([ResponseType.object]),
      handler: (request: EndpointRequest, _token: Record<string, unknown>, _logger: Logger) => {
        const response$ = from(this.documentService.set(request.urlParameters.resourceId, request.body));
        return response$.pipe(map(response => ({ payload: response, code: 200 })));
      }
    };
  }

  public get delete() {
    return {
      responseTypes: new Set([ResponseType.object]),
      handler: (request: EndpointRequest, _token: Record<string, unknown>, _logger: Logger) => {
        const response$ = from(this.documentService.delete(request.urlParameters.resourceId));
        return response$.pipe(map(response => ({ payload: response, code: 204 })));
      }
    };
  }
}
