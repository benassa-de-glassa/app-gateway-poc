import { Logger } from '@benassa-de-glassa/logger';
import { Subscriber } from '@benassa-de-glassa/pub-sub';
import { AuthenticationToken } from '../../token-verifiers/token-verifier';
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
  files?: { [key: string]: any };
}

export enum ResponseType {
  object = 'object',
  file = 'file',
  text = 'text/plain',
  csv = 'text/csv',
  html = 'text/html',
  eventStream = 'text/event-stream'
}
export enum MimeType {
  json = 'application/json',
  xml = 'application/xml',
  text = 'text/plain',
  csv = 'text/csv',
  html = 'text/html',
  eventStream = 'text/event-stream'
}

export interface EndpointResponse {
  payload: any;
  code: number;
  headers?: { [key: string]: string };
}

export type HttpHandler = (
  request: EndpointRequest,
  token: Record<string, unknown>,
  logger: Logger
) => Observable<EndpointResponse>;

export interface Endpoint {
  handler: HttpHandler;
  responseTypes: Set<ResponseType>;
}

export interface GetEndpoint {
  GET: Endpoint;
}
export interface PostEndpoint {
  POST: Endpoint;
}
export interface PatchEndpoint {
  PATCH: Endpoint;
}
export interface DeleteEndpoint {
  DELETE: Endpoint;
}
export interface PutEndpoint {
  PUT: Endpoint;
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
  stream: DuplexStreamHandler;
}
