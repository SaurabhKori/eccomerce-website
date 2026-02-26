import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const currentUser = this.authService.currentUser;
    
    // Check if user is authenticated
    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }
    
    // Check if route requires specific role
    const requiredRole = route.data['role'];
    if (requiredRole && currentUser.role !== requiredRole) {
      // Redirect to appropriate dashboard based on user role
      switch (currentUser.role) {
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
          break;
      }
      return false;
    }
    
    return true;
  }
}
