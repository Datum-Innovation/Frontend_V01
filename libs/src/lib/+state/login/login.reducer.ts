import { createReducer, on } from '@ngrx/store';
import { setToken, clearToken } from './login.actions';
import { LoginState } from './login.models';

export const loginState: LoginState = {
  token: null,
};

export const LOGIN_FEATURE_KEY = 'login';

export const loginReducer = createReducer(
  loginState,
  on(setToken, (state, { token }) => ({ ...state, token })),
  on(clearToken, (state) => ({ ...state, token: null }))
);