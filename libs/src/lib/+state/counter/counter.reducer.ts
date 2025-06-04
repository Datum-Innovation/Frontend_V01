import { createReducer, on } from '@ngrx/store';
import * as CounterActions from './counter.actions';
import { CounterState } from './counter.models';

export const initialState: CounterState = {
  count: 0,
};

export const COUNTER_FEATURE_KEY = 'counter';

export const counterReducer = createReducer(
  initialState,
  on(CounterActions.increment, (state) => ({
    ...state,
    count: state.count + 1,
  })),
  on(CounterActions.decrement, (state) => ({
    ...state,
    count: state.count - 1,
  })),
  on(CounterActions.reset, (state) => ({
    ...state,
    count: 0,
  }))
);
