import { Component } from '@angular/core';

@Component({
  selector: 'dfinance-frontend-main-app-entry',
  template: `
  <main-app-remote-counter></main-app-remote-counter> 
  <main-app-remote-counter-control></main-app-remote-counter-control> 
  `,
})
export class RemoteEntryComponent {}
