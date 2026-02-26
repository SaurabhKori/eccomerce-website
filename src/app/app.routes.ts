import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { ForgotPassword } from './features/auth/forgot-password/forgot-password';
import { AuthGuard } from './guards/auth.guard';
import { customerRoutes } from './features/customer/customer.routes';
import { adminRoutes } from './features/admin/admin.routes';
import { sellerRoutes } from './features/seller/seller.routes';

export const routes: Routes = [
  { path: 'login', component: Login, title: 'Login - ECommerce Store' },
  { path: 'forgot-password', component: ForgotPassword, title: 'Forgot Password - ECommerce Store' },
  
  // Customer Routes (Default)
  ...customerRoutes,
  
  // Admin Routes
  { 
    path: 'admin',
    canActivate: [AuthGuard],
    data: { role: 'admin' },
    children: adminRoutes,
    title: 'Admin - ECommerce Store'
  },
  
  // Seller Routes
  { 
    path: 'seller',
    canActivate: [AuthGuard],
    data: { role: 'seller' },
    children: sellerRoutes,
    title: 'Seller - ECommerce Store'
  },
  
  // Fallback
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];
