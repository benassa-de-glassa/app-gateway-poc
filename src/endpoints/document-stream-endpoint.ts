import { DocumentStreamReadService } from '@benassa-de-glassa/node-utilities/dist/document-service/model/document-stream-read-service.model';

import { StreamEndpoint, WebSocketRequest } from '../model/handlers';
import { Observable, Subject, filter, switchMap } from 'rxjs';

export class DocumentStreamEndpoint implements StreamEndpoint {
  public constructor(
    private readonly documentStreamService: DocumentStreamReadService<{ id: string; message: string }>
  ) {}

  public get streamHandler() {
    const documentId$ = new Subject<string>();
    const handleMessage = (request: WebSocketRequest) => {
      documentId$.next((request.queryParameters.id as string) ?? '');
    };

    return {
      handleMessage,
      broadcastMessage$: documentId$.pipe(
        filter((id: string) => id != null),
        switchMap((id: string) => this.documentStreamService.get$(id) as Observable<any>)
      )
    };
  }
}