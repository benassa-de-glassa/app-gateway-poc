import { Logger } from '@benassa-de-glassa/logger';
import { Subscriber } from '@benassa-de-glassa/pub-sub';
import { AuthenticationToken } from '../token-verifiers/token-verifier';
import { Observable } from 'rxjs';

export interface QueryParameters {
  [key: string]: string;
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
}

export interface EndpointResponse {
  payload: any;
  code: number;
}

export type HttpHandler = (
  request: EndpointRequest,
  token: Record<string, unknown>,
  logger: Logger
) => Observable<EndpointResponse>;

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
  handleMessage: (request: WebSocketRequest, token: AuthenticationToken, logger: Logger) => void;
}
export interface OutgoingStreamHandler {
  broadcastMessage$?: Observable<any>;
  sendMessage$?: Observable<{ targets: Set<string>; message: any }>;
}
export type DuplexStreamHandler = IncomingStreamHandler & OutgoingStreamHandler;

export interface StreamEndpoint {
  streamHandler: DuplexStreamHandler;
}

export type PubSubMessageHandler = (message: unknown) => Promise<void>;

export interface PubSubEndpoint {
  readonly subscriber: Subscriber;
  pubSubMessageHandler: (message: unknown) => Promise<void>;
}
