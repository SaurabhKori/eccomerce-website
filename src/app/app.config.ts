import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authReducer } from './store/auth/auth.reducer';
import { AuthEffects } from './store/auth/auth.effects';
export const appConfig: ApplicationConfig = {
  providers: [
    
    provideStore({ auth: authReducer }),
    provideEffects([AuthEffects]),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),provideHttpClient() ,
    provideRouter(routes), provideClientHydration(withEventReplay())
  ]
};
