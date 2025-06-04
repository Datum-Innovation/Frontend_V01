import { Route } from '@angular/router';
import { RemoteEntryComponent } from './entry.component';
import { LoginComponent } from './login/login.component';
import { CounterComponent } from './ngrx-counter/counter.component';
import { CounterControlComponent } from './ngrx-counter/counter-control.component';
import { NxWelcomeComponent } from './nx-welcome.component';

export const remoteRoutes: Route[] = [
  {
     path: '', 
     component: LoginComponent,
  },
  {
    path: 'counter',
    component: CounterComponent,
  },
  {
    path: 'counter-controls',
    component: CounterControlComponent,
  },
  { 
    path: 'main',
     component: LoginComponent,
  },
  { 
    path: 'remote', 
    component: RemoteEntryComponent,
 },
];
