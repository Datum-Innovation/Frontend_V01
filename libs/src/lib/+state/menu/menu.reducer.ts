// menu.reducer.ts

import { createReducer, on } from '@ngrx/store';
import * as MenuActions from './menu.actions';
import { MenuState } from './menu.state';

export const initialMenuState: MenuState = {
  menuItems: [],
  error: null,
};
export const MENU_FEATURE_KEY = 'menu';

export const menuReducer = createReducer(
  initialMenuState,
  on(MenuActions.loadMenuSuccess, (state, { menuItems }) => ({ ...state, menuItems }))
  // Handle other actions as needed
);
