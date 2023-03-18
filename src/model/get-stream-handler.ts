import { Observable } from 'rxjs';

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
export interface WebSocketRequest extends EndpointRequest {
  message?: any;
}

export interface EndpointResponse {
  payload: any;
  code: number;
}

export interface WebSocketResponse extends EndpointResponse {
  stream$?: Observable<unknown>;
}

export type Handler = (request: WebSocketRequest) => Promise<WebSocketResponse>;
