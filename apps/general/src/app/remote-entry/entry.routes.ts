import { Route } from '@angular/router';
import { RemoteEntryComponent } from './entry.component';
import { AuthGuard } from 'libs/src/lib/auth.guard';
import { BranchComponent } from './branch/branch.component';
import { DepartmentsComponent } from './departments/departments.component';
import { DesignationsComponent } from './designations/designations.component';
import { CostcenterComponent } from './costcenter/costcenter.component';
import { UsersComponent } from './users/users.component';
import { CustomerSupplierComponent } from './customer-supplier/customer-supplier.component';
import { CostCategoryComponent } from './cost-category/cost-category.component';
import { SettingsComponent } from './settings/settings.component';
import { UserRoleComponent } from './user-role/user-role.component';
import { SubmastersComponent } from './submasters/submasters.component';
import { CountersComponent } from './counters/counters.component';
import { PrintComponent } from './print/print.component';

export const remoteRoutes: Route[] = [
  { path: '', component: BranchComponent, canActivate: [AuthGuard]},
  { path: 'company/branch', component: BranchComponent, canActivate: [AuthGuard] },
  { path: 'company/designations', component: DesignationsComponent, canActivate: [AuthGuard] },
  { path: 'company/departments', component: DepartmentsComponent, canActivate: [AuthGuard] },  
  { path: 'costcentre/costcentre', component: CostcenterComponent, canActivate: [AuthGuard] }, 
  { path: 'costcentre/costcategory', component: CostCategoryComponent, canActivate: [AuthGuard] },   
  { path: 'users/users', component: UsersComponent, canActivate: [AuthGuard] },
  { path: 'users/roles', component: UserRoleComponent, canActivate: [AuthGuard] },
  { path: 'customer-supplier', component: CustomerSupplierComponent, canActivate: [AuthGuard] },
  { path: 'settings/settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'settings/submasters', component: SubmastersComponent, canActivate: [AuthGuard] },
  { path: 'counters',component: CountersComponent, canActivate:[AuthGuard]}	,
  { path: 'settings/print', component: PrintComponent, canActivate: [AuthGuard] },
];
