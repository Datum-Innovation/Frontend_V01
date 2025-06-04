import { Injectable } from '@angular/core';
import { StorageService } from './services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private storageService: StorageService) {   
  }

  isLoggedIn(){
    return !!this.storageService.getLocalStorageItem('access_token');
  }
}
