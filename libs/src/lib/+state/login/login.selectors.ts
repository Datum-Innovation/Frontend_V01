import { createSelector, createFeatureSelector } from '@ngrx/store';
import { LoginState } from './login.models';

// Create a feature selector for the app state
const selectLoginState = createFeatureSelector<LoginState>('login');

// Define the selector to get the token
export const selectToken = createSelector(
  selectLoginState,
  (state) => state.token
);