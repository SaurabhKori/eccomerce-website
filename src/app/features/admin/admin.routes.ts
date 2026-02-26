import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard/dashboard')
        .then(m => m.Dashboard),
    title: 'Admin Dashboard - ECommerce Store'
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./products/products')
        .then(m => m.Products),
    title: 'Admin Products - ECommerce Store'
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./orders/orders')
        .then(m => m.Orders),
    title: 'Admin Orders - ECommerce Store'
  },
  {
    path: 'customers',
    loadComponent: () =>
      import('./customers/customers')
        .then(m => m.Customers),
    title: 'Admin Customers - ECommerce Store'
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./categories/categories')
        .then(m => m.Categories),
    title: 'Admin Categories - ECommerce Store'
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./analytics/analytics')
        .then(m => m.Analytics),
    title: 'Admin Analytics - ECommerce Store'
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings/settings')
        .then(m => m.Settings),
    title: 'Admin Settings - ECommerce Store'
  }
];
