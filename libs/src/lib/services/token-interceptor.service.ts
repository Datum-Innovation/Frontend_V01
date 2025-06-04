// import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpErrorResponse } from "@angular/common/http";
// import { Injectable, Injector } from '@angular/core';
// import { Observable, throwError } from "rxjs";
// import { catchError } from 'rxjs/operators';
// import { BaseService } from "./base.service";

// @Injectable({
//   providedIn: 'root'
// })
// export class TokenInterceptorService implements HttpInterceptor {
  
//   constructor(private inject: Injector) { }

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     let baseService = this.inject.get(BaseService);
    
//     // Endpoints that should not receive Authorization headers
//     const excludeEndpoints = ['/CmpLogin', 'auth/setcon', 'branch/DropDown'];
//     const shouldSkip = excludeEndpoints.some(url => req.url.includes(url));

//     if (shouldSkip) {
//       return next.handle(req);
//     }

//     const token = baseService.getToken();

//     if (!token) {
//       return next.handle(req).pipe(
//         catchError((error: HttpErrorResponse) => {
//           if (error.status === 401) {
//             baseService.clearLocalStorage();
//             window.location.href = '/login';
//           }
//           return throwError(() => error);
//         })
//       );
//     }

//     const bearerToken = req.clone({
//       setHeaders: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//         accept: "application/json",
//       }
//     });

//     return next.handle(bearerToken).pipe(
//       catchError((error: HttpErrorResponse) => {
//         if (error.status === 401) {
//           baseService.clearLocalStorage();
//           window.location.href = '/login';
//         }
//         return throwError(() => error);
//       })
//     );
//   }
// }

  import { Injectable, inject } from '@angular/core';
  import {
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpEvent
  } from '@angular/common/http';
  import { Observable } from 'rxjs';
  import { BaseService } from './base.service';

  @Injectable({
    providedIn: 'root'
  })
  export class TokenInterceptorService implements HttpInterceptor {
    private baseService = inject(BaseService); // Angular 16+ compatible

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      // Endpoints that should not receive Authorization headers
      const excludeEndpoints = ['/CmpLogin', 'auth/setcon','branch/DropDown'];
      const shouldSkip = excludeEndpoints.some(url => req.url.includes(url));

      if (shouldSkip) {
        return next.handle(req);
      }

      const token = this.baseService.getLocalStorgeItem('access_token');

      const bearerToken = req.clone({
        setHeaders: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });

      return next.handle(bearerToken);
    }
  }


