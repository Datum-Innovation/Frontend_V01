// menu.actions.ts

import { createAction, props } from '@ngrx/store';
import { MenuItem } from './menu.state';

//export const loadMenu = createAction('[Menu] Load Menu');
export const loadMenuSuccess = createAction('[Menu] Load Menu Success', props<{ menuItems: MenuItem[] }>());
export const loadMenuFailure = createAction('[Menu] Load Menu Failure', props<{ error: any }>());
