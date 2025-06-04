import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectCount } from '@dfinance-frontend/shared';

@Component({
  selector: 'login-app-counter',
  template: `
    <div>
      <p>Counter Value: {{ counterValue$ | async }}</p>
    </div>
  `,
})
export class CounterComponent {
  counterValue$ = this.store.select(selectCount);

  constructor(private store: Store) {}
}
