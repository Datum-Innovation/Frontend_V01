import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  AuthInterceptorService,
  EmailInputDirective,
  MenuModule,
  SharedModule,
  TelephoneInputDirective,
  TextOnlyDirective,
  TokenInterceptorService,
} from '@dfinance-frontend/shared';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BaseService } from '@dfinance-frontend/shared';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { RemoteEntryComponent } from './entry.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { remoteRoutes } from './entry.routes';
import { BranchComponent } from './branch/branch.component';
import { DepartmentsComponent } from './departments/departments.component';
import { DesignationsComponent } from './designations/designations.component';
import { CostcenterComponent } from './costcenter/costcenter.component';
import { CompanypopupComponent } from '../companypopup/companypopup.component';
import { UsersComponent } from './users/users.component';
import { UserrolepopupComponent } from './userrolepopup/userrolepopup.component';
import { CustomerSupplierComponent } from './customer-supplier/customer-supplier.component';
import { CostCategoryComponent } from './cost-category/cost-category.component';
import { SettingsComponent } from './settings/settings.component';
import { UserRoleComponent } from './user-role/user-role.component';
import { SubmastersComponent } from './submasters/submasters.component';
import { CountersComponent } from './counters/counters.component';
import { PrintComponent } from './print/print.component';

@NgModule({
  declarations: [
    RemoteEntryComponent,
    NxWelcomeComponent,
    BranchComponent,
    DepartmentsComponent,
    DesignationsComponent,
    CostcenterComponent,
    CompanypopupComponent,
    UsersComponent,
    UserrolepopupComponent,
    CustomerSupplierComponent,
    CostCategoryComponent,
    SettingsComponent,
    UserRoleComponent,
    SubmastersComponent,
    TextOnlyDirective,
    TelephoneInputDirective,
    EmailInputDirective,
    CountersComponent,
    PrintComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(remoteRoutes),
    MenuModule,
    TabsModule.forRoot(),
  ],
  providers: [
    SharedModule,
    BaseService,
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
    DatePipe,
  ],
})
export class RemoteEntryModule {}
