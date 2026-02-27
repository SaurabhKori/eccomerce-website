import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { User } from '../../services/auth.service';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: any;
}

export const initialState: AuthState = {
  user: null,
  loading: false,
  error: null
};

export const authReducer = createReducer(

  initialState,

  on(AuthActions.login, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    loading: false,
    user: user
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(AuthActions.logout, () => initialState)
);