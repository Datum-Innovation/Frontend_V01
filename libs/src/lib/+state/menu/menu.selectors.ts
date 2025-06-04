// menu.selectors.ts

import { createFeatureSelector, createSelector } from '@ngrx/store';
// import { AppState } from '../app.state';
import { MenuState } from './menu.state';

const selectMenuState = createFeatureSelector< MenuState>('menu');

export const selectMenuItems = createSelector(selectMenuState, (state) => state.menuItems);