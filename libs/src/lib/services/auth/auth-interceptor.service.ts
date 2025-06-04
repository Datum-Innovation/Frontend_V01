import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {
  constructor(
    private router: Router,
    private baseService : BaseService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(error => {
        if (error.status == 401) {
          this.baseService.clearLocalStorage();
          this.router.navigate(['/login']);
        }
        if(error.error == "The ConnectionString property has not been initialized."){
          this.baseService.clearLocalStorage();
          this.router.navigate(['/login']);
        }
        return throwError(error);
      })
    );
  }
}