import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '@dfinance-frontend/shared';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

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
   * Save the details
   * @param endpoint api
   * @param data 
  */
 saveDetails(endpoint: string, data: any): Observable<any> {
   return this.baseService.post(endpoint, data);
  }
}