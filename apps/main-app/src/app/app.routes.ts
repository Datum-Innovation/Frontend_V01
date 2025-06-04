import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'main-app',
    loadChildren: () =>
      import('./remote-entry/entry.module').then((m) => m.RemoteEntryModule),
  },
];
