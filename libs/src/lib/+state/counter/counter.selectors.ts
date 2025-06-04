import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CounterState } from './counter.models';

const selectCounterState = createFeatureSelector<CounterState>('counter');

export const selectCount = createSelector(
  selectCounterState,
  (state) => state.count
);
