import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class AuthEffects {

  // ✅ Correct injection method for Angular 16+
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(action =>
        this.authService.login(action.credentials).pipe(
          tap(user => this.authService.saveToken(user.token)),
          map(user =>
            AuthActions.loginSuccess({ user })
          ),
          catchError(error =>
            of(AuthActions.loginFailure({ error }))
          )
        )
      )
    )
  );

  loginRedirect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(() => this.router.navigate(['/']))
    ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        this.authService.clearToken();
        this.router.navigate(['/login']);
      })
    ),
    { dispatch: false }
  );
}