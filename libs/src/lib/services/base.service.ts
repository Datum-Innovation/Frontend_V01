import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { APP_URL } from '../environments/environment';
import { CustomDialogueComponent } from '../components/custom-dialogue/custom-dialogue.component';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class BaseService {

  companies: any;

  constructor(
    private httpClient: HttpClient,    
    private storageService: StorageService,
    private dialog: MatDialog,
  ) {}


  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
    const skey = this.storageService.getLocalStorageItem('skey');
    
    if (skey) {
      headers = headers.set('skey', skey);
    }
   
    return headers;
   
  }

  // Session-based access token
  setToken(token: string) {
    sessionStorage.setItem('access_token', token);
  }

  getToken(): string {
    return sessionStorage.getItem('access_token') || '';
  }

  // Local storage utilities
  setLocalStorgeItem(fieldName: string, fieldValue: string) {
    localStorage.setItem(fieldName, fieldValue);
  }

  getLocalStorgeItem(fieldName: string): string {
    return localStorage.getItem(fieldName) || '';
  }

  clearLocalStorage(): void {
    sessionStorage.clear();
    localStorage.clear();
  }

  // HTTP GET
  // get(endpoint: string): Observable<any> {
  //   const headers = this.getAuthHeaders();
  //   return this.httpClient.get(`${APP_URL.API}${endpoint}`, { headers }).pipe(
  //     catchError((error: any) => throwError(() => error))
  //   );
  // }

  get<T>(endpoint: string): Observable<T> {
    return this.httpClient.get<T>(`${APP_URL.API}${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  // HTTP POST
  post(endpoint: string, data: any): Observable<any> {
    const headers = this.getAuthHeaders(true);
    return this.httpClient.post(`${APP_URL.API}${endpoint}`, data, { headers }).pipe(
      catchError((error: any) => throwError(() => error))
    );
  }

  // HTTP PATCH
  patch(endpoint: string, data: any): Observable<any> {
    const headers = this.getAuthHeaders(true);
    return this.httpClient.patch(`${APP_URL.API}${endpoint}`, data, { headers }).pipe(
      catchError((error: any) => throwError(() => error))
    );
  }

  // HTTP DELETE
  delete(endpoint: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.httpClient.delete(`${APP_URL.API}${endpoint}`, { headers }).pipe(
      catchError((error: any) => throwError(() => error))
    );
  }

  // Dynamic header generator
  private getAuthHeaders(includeJson: boolean = false): HttpHeaders {
    const token = this.getToken();
    const skey = this.storageService.getLocalStorageItem('skey');

    let headersConfig: any = {
      'Authorization': `Bearer ${token}`,
      'skey': skey
    };

    if (includeJson) {
      headersConfig['Content-Type'] = 'application/json';
      headersConfig['Accept'] = 'application/json';
    }
console.log("Header:"+headersConfig)
console.log("skey:"+skey)
    return new HttpHeaders(headersConfig);
  }

  // Menu handling
  getMenuByUrl(url: string): any | null {
    let menuItems: any = localStorage.getItem('menuData');
    if (menuItems) {
      menuItems = JSON.parse(menuItems);
    } else {
      return null;
    }
    return this.findMenu(menuItems, url);
  }

  findMenu(items: any[], url: string): any | null {
    for (const item of items) {
      if (item.url === url) {
        return item;
      }
      if (item.submenu && item.submenu.length > 0) {
        const found = this.findMenu(item.submenu, url);
        if (found !== null) {
          return found;
        }
      }
    }
    return null;
  }

  formatInput(inputNumber: any) {
    let decimalPlaces = Number(this.storageService.getLocalStorageItem('numericformat'));
    if (typeof inputNumber === 'number' && !isNaN(inputNumber)) {
      return inputNumber.toFixed(decimalPlaces);
    } else {
      return inputNumber;
    }
  }

  showCustomDialogue(message: string, title: string = '', inputKey: string = 'custom'): Promise<boolean> {
    const dialogRef = this.dialog.open(CustomDialogueComponent, {
      width: '300px',
      height: '200px',
      data: { message, title, key: inputKey }
    });

    return dialogRef.afterClosed().toPromise();
  }

  showCustomDialogues(dialogData: { key: string, title: string, message: string, onAction: (action: string) => void }) {
    const dialogRef = this.dialog.open(CustomDialogueComponent, {
      width: '300px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        dialogData.onAction(result ? 'OK' : 'Cancel');
      }
    });
  }
  // Show Toast Message or Alert (Customized)
  showAlert(message: string, type: 'success' | 'error' | 'info' = 'error'): void {
    const dialogRef = this.dialog.open(CustomDialogueComponent, {
      width: '300px',
      height: '150px',
      data: { message, key: type } // Pass the type ('success', 'error', etc.)
    });

    setTimeout(() => {
      dialogRef.close();
    }, 3000); // Close the toast/alert after 3 seconds
  }

}
