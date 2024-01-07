import { Observable } from 'rxjs';
import { EndpointResponse } from '../../express-common/model/handlers';

export interface ResponseHandler {
  handle(response: Observable<EndpointResponse>): Promise<void>;
}
