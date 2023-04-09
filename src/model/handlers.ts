import { Observable } from '@benassa-de-glassa/node-utilities/dist/models/observable.model';

export interface QueryParameters {
  [key: string]: undefined | string | string[] | QueryParameters | QueryParameters[];
}

export interface UrlParameters {
  [key: string]: string;
}

export interface Headers {
  [key: string]: string | string[] | undefined;
}

export interface EndpointRequest {
  body: any;
  lowercaseHeaders: Headers;
  urlParameters: UrlParameters;
  queryParameters: QueryParameters;
  correlationId: string;
}

export interface EndpointResponse {
  payload: any;
  code: number;
}

export type HttpHandler = (request: EndpointRequest) => Promise<EndpointResponse>;

export interface GetEndpoint {
  getHandler: HttpHandler;
}
export interface PostEndpoint {
  postHandler: HttpHandler;
}
export interface PatchEndpoint {
  patchHandler: HttpHandler;
}
export interface DeleteEndpoint {
  deleteHandler: HttpHandler;
}
export interface PutEndpoint {
  putHandler: HttpHandler;
}

export interface WebSocketRequest extends EndpointRequest {
  clientId: string;
  message?: any;
}
export interface WebSocketResponse extends EndpointResponse {
  stream$: Observable<unknown>;
}

export interface IncomingStreamHandler {
  handleMessage: (request: WebSocketRequest) => void;
}
export interface OutgoingStreamHandler {
  broadcastMessage$?: Observable<any>;
  sendMessage$?: Observable<{ targets: Set<string>; message: any }>;
}
export type DuplexStreamHandler = IncomingStreamHandler & OutgoingStreamHandler;

export interface StreamEndpoint {
  streamHandler: DuplexStreamHandler;
}
