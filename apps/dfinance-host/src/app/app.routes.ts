import { AppComponent } from './app.component';
import { CounterControlsComponent } from './ngrx-store/counter-controls/counter-controls.component';
import { CounterComponent } from './ngrx-store/counter/counter.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  {
    path: '',
    component: NxWelcomeComponent,
  },
  {
    path: 'counter',
    component: CounterComponent,
  },
  {
    path: 'counter-controls',
    component: CounterControlsComponent,
  },
  {
    path: 'login',
    loadChildren: () => import('login/Module').then((m) => m.RemoteEntryModule),
  },
  {
    path: 'main-app',
    loadChildren: () =>
      import('main-app/Module').then((m) => m.RemoteEntryModule),
  },
  {
    path: 'general',
    loadChildren: () => import('general/Module').then((m) => m.RemoteEntryModule),
  },
  {
    path: 'inventory',
    loadChildren: () => import('inventory/Module').then((m) => m.RemoteEntryModule),
  },
  {
    path: 'finance',
    loadChildren: () => import('finance/Module').then((m) => m.RemoteEntryModule),
  },
  {
    path: 'welcome',
    component: NxWelcomeComponent,
  },
];
