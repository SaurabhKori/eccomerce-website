import { Routes } from '@angular/router';

export const sellerRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./seller-dashboard/seller-dashboard')
        .then(m => m.SellerDashboard),
    title: 'Seller Dashboard - ECommerce Store'
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./products/products')
        .then(m => m.SellerProducts),
    title: 'Seller Products - ECommerce Store'
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./orders/orders')
        .then(m => m.SellerOrders),
    title: 'Seller Orders - ECommerce Store'
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./analytics/analytics')
        .then(m => m.SellerAnalytics),
    title: 'Seller Analytics - ECommerce Store'
  },
  {
    path: 'reviews',
    loadComponent: () =>
      import('./reviews/reviews')
        .then(m => m.SellerReviews),
    title: 'Seller Reviews - ECommerce Store'
  }
];
