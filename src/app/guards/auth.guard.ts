import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map, take } from 'rxjs';
import { selectUser } from '../store/auth/auth.selectors';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private store: Store,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {

    return this.store.select(selectUser).pipe(
      take(1),
      map(user => {

        // ❌ Not logged in
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }

        // 🔐 Role-based protection
        const requiredRole = route.data['role'];

        if (requiredRole && user.role !== requiredRole) {

          // Redirect based on role
          switch (user.role) {
            case 'admin':
              this.router.navigate(['/admin']);
              break;

            case 'seller':
              this.router.navigate(['/seller']);
              break;

            case 'customer':
              this.router.navigate(['/']);
              break;

            default:
              this.router.navigate(['/']);
          }

          return false;
        }

        return true;
      })
    );
  }
}