import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Products } from './products/products';
import { ProductDetail } from './product-detail/product-detail';
import { Cart } from './cart/cart';
import { Wishlist } from './wishlist/wishlist';
import { Checkout } from './checkout/checkout';
import { OrderSuccess } from './order-success/order-success';
import { Orders } from './orders/orders';
import { OrderTracking } from './order-tracking/order-tracking';
import { Payment } from './payment/payment';
import { Reviews } from './reviews/reviews';
import { Profile } from './profile/profile';
import { Notifications } from './notifications/notifications';

export const customerRoutes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Home - ECommerce Store'
  },
  {
    path: 'products',
    component: Products,
    title: 'Products - ECommerce Store'
  },
  {
    path: 'products-detail',
    component: ProductDetail,
    title: 'Product Details - ECommerce Store'
  },
  {
    path: 'cart',
    component: Cart,
    title: 'Shopping Cart - ECommerce Store'
  },
  {
    path: 'wishlist',
    component: Wishlist,
    title: 'My Wishlist - ECommerce Store'
  },
  {
    path: 'checkout',
    component: Checkout,
    title: 'Checkout - ECommerce Store'
  },
  {
    path: 'order-success',
    component: OrderSuccess,
    title: 'Order Success - ECommerce Store'
  },
  {
    path: 'orders',
    component: Orders,
    title: 'My Orders - ECommerce Store'
  },
  {
    path: 'orders/:id/track',
    component: OrderTracking,
    title: 'Order Tracking - ECommerce Store'
  },
  {
    path: 'payment',
    component: Payment,
    title: 'Payment - ECommerce Store'
  },
  {
    path: 'reviews',
    component: Reviews,
    title: 'Reviews - ECommerce Store'
  },
  {
    path: 'reviews/:id',
    component: Reviews,
    title: 'Product Reviews - ECommerce Store'
  },
  {
    path: 'profile',
    component: Profile,
    title: 'My Profile - ECommerce Store'
  },
  {
    path: 'notifications',
    component: Notifications,
    title: 'Notifications - ECommerce Store'
  }
];
