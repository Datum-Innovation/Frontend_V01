import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RemoteEntryComponent } from './entry.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { remoteRoutes } from './entry.routes';
import { LoginComponent } from './login/login.component';
import { SharedModule, TokenInterceptorService } from '@dfinance-frontend/shared';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CounterComponent } from './ngrx-counter/counter.component';
import { CounterControlComponent } from './ngrx-counter/counter-control.component';
import { BaseService } from '@dfinance-frontend/shared';
@NgModule({
  declarations: [
    RemoteEntryComponent, 
    NxWelcomeComponent, 
    LoginComponent,
    CounterComponent,
    CounterControlComponent
  ],
  imports: [
    CommonModule, 
    SharedModule,
    RouterModule.forChild(remoteRoutes),
  ],
  providers: [
    SharedModule,
    BaseService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    },
  ],
})
export class RemoteEntryModule {}
