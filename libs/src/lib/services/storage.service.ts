import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  setLocalStorageItem(fieldName: string, fieldValue: string) {
    localStorage.setItem(fieldName, fieldValue);
  }

  getLocalStorageItem(fieldName: string) {
    return localStorage.getItem(fieldName) || "";
  }

  clearLocalStorage(): void {
    localStorage.clear();
  }

  setToken(token: string) {
    sessionStorage.setItem('access_token', token);
  }

  getToken() {
    return sessionStorage.getItem('access_token') || "";
  }
} 