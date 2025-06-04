import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '@dfinance-frontend/shared';
@Injectable({
    providedIn: 'root'
  })
  export class AccountConfigService {

    constructor(
      private baseService:BaseService
    ) { }

    /**
   * Get the details
   * @param endpoint api
  */
 getDetails(endpoint: string): Observable<any> {
    return this.baseService.get(endpoint);
   }
  /**
   * Update the details
   * @param endpoint api
   * @param data 
  */
  updateDetails(endpoint: string, data: any): Observable<any> {
    return this.baseService.patch(endpoint, data);
  }
}
