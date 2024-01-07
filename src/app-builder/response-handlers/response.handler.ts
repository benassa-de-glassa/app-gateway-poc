import { Observable } from 'rxjs';
import { EndpointResponse } from '../model/handlers';

export interface ResponseHandler {
  handle(response: Observable<EndpointResponse>): Promise<void>;
}
