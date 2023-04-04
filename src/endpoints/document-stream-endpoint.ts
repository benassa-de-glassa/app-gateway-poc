import { DocumentStreamReadService } from '@benassa-de-glassa/node-utilities/dist/document-service/model/document-stream-read-service.model';

import { StreamEndpointHandler, WebSocketRequest } from '../model/handlers';
import { Observable, Subject, filter, map, switchMap, tap } from 'rxjs';

export class DocumentStreamEndpoint implements StreamEndpointHandler {
  public constructor(
    private readonly documentStreamService: DocumentStreamReadService<{ id: string; message: string }>
  ) {}

  public get streamHandler() {
    const documentId$ = new Subject<string>();
    const handleMessage = (request: WebSocketRequest) => {
      console.log(request);
      documentId$.next((request.queryParameters.id as string) ?? '');
    };

    return {
      handleMessage,
      broadcastMessage$: documentId$.pipe(
        tap(console.log),
        filter((id: string) => id != null),
        switchMap((id: string) => {
          return this.documentStreamService.get$(id) as Observable<any>;
        }),
        map(doc => JSON.stringify(doc, undefined, 2))
      )
    };
  }
}
