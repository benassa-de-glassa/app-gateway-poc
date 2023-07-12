import { IdentifiedEntity } from '@benassa-de-glassa/models';
import { DocumentService } from '@benassa-de-glassa/document-service';
import { DeleteEndpoint, EndpointResponse, GetEndpoint, PatchEndpoint, PutEndpoint } from '../express/model/handlers';
import { EndpointRequest } from '../express/model/handlers';
import { Logger } from '@benassa-de-glassa/logger';

export class DocumentResourceEndpoint<Document extends IdentifiedEntity>
  implements GetEndpoint, PutEndpoint, PatchEndpoint, DeleteEndpoint
{
  public constructor(private readonly documentService: DocumentService<Document>) {}

  public async getHandler(
    request: EndpointRequest,
    _token: Record<string, unknown>,
    _logger: Logger
  ): Promise<EndpointResponse> {
    return {
      payload: await this.documentService.read(request.urlParameters.resourceId),
      code: 200
    };
  }

  public async patchHandler(request: EndpointRequest, _token: Record<string, unknown>, _logger: Logger) {
    return {
      payload: await this.documentService.update(request.urlParameters.resourceId, request.body),
      code: 200
    };
  }

  public async putHandler(request: EndpointRequest, _token: Record<string, unknown>, _logger: Logger) {
    return {
      payload: await this.documentService.set(request.urlParameters.resourceId, request.body),
      code: 200
    };
  }

  public async deleteHandler(request: EndpointRequest, _token: Record<string, unknown>, _logger: Logger) {
    return {
      payload: await this.documentService.delete(request.urlParameters.resourceId),
      code: 200
    };
  }
}
