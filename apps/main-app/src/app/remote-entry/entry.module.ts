import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RemoteEntryComponent } from './entry.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { remoteRoutes } from './entry.routes';
import { MainRootComponent } from './main-root/main-root.component';
import { AuthInterceptorService, MenuModule, SharedModule, TokenInterceptorService } from '@dfinance-frontend/shared';
import { RemoteCounterComponent } from './ngrx-counter/remote-counter.component';
import { RemoteCounterControlComponent } from './ngrx-counter/remote-counter-control.component';
import { DummyMenuComponent } from './main-root/dummy-menu/dummy-menu.component';
import { DynamicMenuCreationComponent } from './main-root/dynamic-menu-creation/dynamic-menu-creation/dynamic-menu-creation.component';
import { MenuItemAMComponent } from './main-root/dynamic-menu-creation/dynamic-menu-creation/angular-material-menu/menu-item/menu-item-am.component';
import { MenuItemNGComponent } from './main-root/dynamic-menu-creation/dynamic-menu-creation/ngx-bootstrap-menu/menu-item/menu-item-ng.component';
import { NgxBootstrapMenuComponent } from './main-root/dynamic-menu-creation/dynamic-menu-creation/ngx-bootstrap-menu/nb-menu.component';
import { AngularMaterialMenuComponent } from './main-root/dynamic-menu-creation/dynamic-menu-creation/angular-material-menu/am-menu.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  declarations: [
    RemoteEntryComponent, 
    NxWelcomeComponent, 
    MainRootComponent,
    RemoteCounterComponent,
    RemoteCounterControlComponent,
    DummyMenuComponent,
    DynamicMenuCreationComponent,
    MenuItemAMComponent,
    MenuItemNGComponent,
    AngularMaterialMenuComponent,
    NgxBootstrapMenuComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CollapseModule.forRoot(),
    RouterModule.forChild(remoteRoutes),
    MenuModule
  ],
  exports: [
    MainRootComponent
  ],
  providers: [
    SharedModule,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    },
  ],
})
export class RemoteEntryModule {}
