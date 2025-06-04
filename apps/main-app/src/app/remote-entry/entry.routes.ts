import { Route } from '@angular/router';
import { RemoteEntryComponent } from './entry.component';
import { MainRootComponent } from './main-root/main-root.component';
import { RemoteCounterComponent } from './ngrx-counter/remote-counter.component';
import { RemoteCounterControlComponent } from './ngrx-counter/remote-counter-control.component';
import { DummyMenuComponent } from './main-root/dummy-menu/dummy-menu.component';
import { DynamicMenuCreationComponent } from './main-root/dynamic-menu-creation/dynamic-menu-creation/dynamic-menu-creation.component';
import { AuthGuard } from 'libs/src/lib/auth.guard';

export const remoteRoutes: Route[] = [
  {
    path: '', 
    component: MainRootComponent, 
    canActivate: [AuthGuard]
  },
  { 
    path: 'main-root', 
    component: MainRootComponent, 
    canActivate: [AuthGuard]
  },
  { 
    path: 'dummy-menu', 
    component: DummyMenuComponent, 
  },
  { 
    path: 'main-menu', 
    component: DynamicMenuCreationComponent, 
  },
  {
    path: 'remote-counter',
    component: RemoteCounterComponent,
  },
  {
    path: 'remote-counter-controls',
    component: RemoteCounterControlComponent,
  },
  { 
    path: 'remote', 
    component: RemoteEntryComponent, 
  },
];
