import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { NavItem } from '../../../shared/components/sidebar/sidebar';

interface OrderDetails {
  id: string;
  orderDate: string;
  deliveryDate: string;
  status: string;
  total: number;
  items: {
    id: number;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

@Component({
  selector: 'app-order-success',
  imports: [CommonModule, Sidebar],
  templateUrl: './order-success.html',
  styleUrl: './order-success.css'
})
export class OrderSuccess implements OnInit {
  sidebarCollapsed = false;
  orderId: string | null = null;
  orderDetails: OrderDetails | null = null;
  loading = false;
  
  // Navigation items for sidebar
  navItems: NavItem[] = [
    { path: '/', label: 'Home', icon: 'fas fa-home' },
    { path: '/products', label: 'Products', icon: 'fas fa-box' },
    { path: '/cart', label: 'Cart', icon: 'fas fa-shopping-cart' },
    { path: '/orders', label: 'Orders', icon: 'fas fa-list' },
    { path: '/wishlist', label: 'Wishlist', icon: 'fas fa-heart' },
    { path: '/profile', label: 'Profile', icon: 'fas fa-user' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.queryParamMap.get('orderId');
    if (this.orderId) {
      this.loadOrderDetails(this.orderId);
    } else {
      // Generate a mock order ID for demo purposes
      this.orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      this.orderDetails = this.generateMockOrderDetails(this.orderId);
    }
  }

  loadOrderDetails(orderId: string): void {
    this.loading = true;
    this.http.get<OrderDetails>(`/api/orders/${orderId}`).subscribe({
      next: (order) => {
        this.orderDetails = order;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order details:', error);
        this.loading = false;
        this.orderDetails = this.generateMockOrderDetails(orderId);
      }
    });
  }

  trackOrder(): void {
    if (this.orderId) {
      this.router.navigate(['/orders', this.orderId, 'track']);
    }
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  viewOrderHistory(): void {
    this.router.navigate(['/orders']);
  }

  downloadInvoice(): void {
    if (this.orderId) {
      window.open(`/api/orders/${this.orderId}/invoice`, '_blank');
    }
  }

  shareOrder(): void {
    if (this.orderId) {
      const shareText = `I just placed an order with #${this.orderId}! 🛍️`;
      if (navigator.share) {
        navigator.share({
          title: 'Order Placed Successfully',
          text: shareText,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText + ' ' + window.location.href);
        alert('Order details copied to clipboard!');
      }
    }
  }

  formatCurrency(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  private generateMockOrderDetails(orderId: string): OrderDetails {
    const orderDate = new Date();
    const deliveryDate = new Date(orderDate.getTime() + (5 * 24 * 60 * 60 * 1000)); // 5 days from now

    return {
      id: orderId,
      orderDate: orderDate.toISOString(),
      deliveryDate: deliveryDate.toISOString(),
      status: 'Confirmed',
      total: 559.96,
      items: [
        {
          id: 1,
          name: 'Wireless Headphones',
          image: 'https://via.placeholder.com/100x100',
          price: 79.99,
          quantity: 2
        },
        {
          id: 2,
          name: 'Smart Watch',
          image: 'https://via.placeholder.com/100x100',
          price: 199.99,
          quantity: 1
        },
        {
          id: 3,
          name: 'Laptop Stand',
          image: 'https://via.placeholder.com/100x100',
          price: 29.99,
          quantity: 3
        }
      ],
      shippingAddress: {
        name: 'John Doe',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      }
    };
  }
}
