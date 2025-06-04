
import { Component, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { increment, decrement, reset } from '@dfinance-frontend/shared'; 

@Component({
  selector: 'main-app-remote-counter-control',
  template: `
    <div>
      <button (click)="increment()">Increment</button>
      <button (click)="decrement()">Decrement</button>
      <button (click)="reset()">Reset</button>
    </div>
  `,
  encapsulation: ViewEncapsulation.None
})
export class RemoteCounterControlComponent {
  constructor(private store: Store) {}

  increment() {
    this.store.dispatch(increment());
  }

  decrement() {
    this.store.dispatch(decrement());
  }

  reset() {
    this.store.dispatch(reset());
  }
}
