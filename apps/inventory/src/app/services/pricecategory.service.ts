import { Injectable } from "@angular/core";
import { BaseService } from "@dfinance-frontend/shared";
import { Observable } from "rxjs";

@Injectable({
    providedIn:'root'
})
export class PriceCategoryService{
    constructor(
        private baseService : BaseService
    ){}


    /**
   * Get the details
   * @param endpoint api
  */ 
 getDetails(endpoint: string): Observable<any>
 {
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
  /**
   * Save the details
   * @param endpoint api
   * @param data 
  */
  saveDetails(endpoint: string, data: any): Observable<any> {
    return this.baseService.post(endpoint, data);
   }
   /**
   * Delete the details
   * @param endpoint api
   * @param data 
  */
  deleteDetails(endpoint: string): Observable<any> {
    return this.baseService.delete(endpoint);
  }

}
   
    
