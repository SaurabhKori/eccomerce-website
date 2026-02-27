import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { Navbar } from '../../../shared/components/navbar/navbar';

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  completed: boolean;
  current: boolean;
}

interface OrderDetails {
  id: string;
  status: string;
  orderDate: string;
  estimatedDelivery: string;
  trackingNumber: string;
  courier: string;
  currentLocation: string;
  items: {
    id: number;
    name: string;
    image: string;
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
  selector: 'app-order-tracking',
  imports: [CommonModule, Navbar],
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.css'
})
export class OrderTracking implements OnInit {
  sidebarCollapsed = false;
  orderId: string | null = null;
  orderDetails: OrderDetails | null = null;
  trackingSteps: TrackingStep[] = [];
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
    this.orderId = this.route.snapshot.paramMap.get('id');
    if (this.orderId) {
      this.loadOrderTracking(this.orderId);
    }
  }

  loadOrderTracking(orderId: string): void {
    this.loading = false;
    // this.http.get<any>(`/api/orders/${orderId}/tracking`).subscribe({
    //   next: (data) => {
    //     this.orderDetails = data.order;
    //     this.trackingSteps = data.tracking;
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error loading tracking:', error);
    //     this.loading = false;
    //     const mockData = this.generateMockTrackingData(orderId);
    //     this.orderDetails = mockData.order;
    //     this.trackingSteps = mockData.tracking;
    //   }
    // });
   this.orderDetails = this.generateMockTrackingData(orderId).order;
   this.trackingSteps = this.generateMockTrackingData(orderId).tracking;
   console.log(this.orderDetails);
   console.log(this.trackingSteps);
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  contactSupport(): void {
    this.router.navigate(['/contact'], { 
      queryParams: { subject: `Order Inquiry - ${this.orderId}` } 
    });
  }

  downloadInvoice(): void {
    if (this.orderId) {
      window.open(`/api/orders/${this.orderId}/invoice`, '_blank');
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  private generateMockTrackingData(orderId: string): { order: OrderDetails; tracking: TrackingStep[] } {
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - 3);
    
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 2);

    const order: OrderDetails = {
      id: orderId,
      status: 'Shipped',
      orderDate: orderDate.toISOString(),
      estimatedDelivery: estimatedDelivery.toISOString(),
      trackingNumber: 'TRK' + Math.random().toString(36).substr(2, 12).toUpperCase(),
      courier: 'Express Delivery',
      currentLocation: 'Distribution Center, New York',
      items: [
        {
          id: 1,
          name: 'Wireless Headphones',
          image: 'https://via.placeholder.com/100x100',
          quantity: 2
        },
        {
          id: 2,
          name: 'Smart Watch',
          image: 'https://via.placeholder.com/100x100',
          quantity: 1
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

    const tracking: TrackingStep[] = [
      {
        id: '1',
        title: 'Order Confirmed',
        description: 'Your order has been confirmed and is being processed',
        date: orderDate.toISOString().split('T')[0],
        time: '10:30 AM',
        completed: true,
        current: false
      },
      {
        id: '2',
        title: 'Order Processed',
        description: 'Your order has been processed and handed over to courier',
        date: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '2:45 PM',
        completed: true,
        current: false
      },
      {
        id: '3',
        title: 'In Transit',
        description: 'Your package is in transit and will be delivered soon',
        date: new Date(orderDate.getTime() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '9:15 AM',
        completed: true,
        current: true
      },
      {
        id: '4',
        title: 'Out for Delivery',
        description: 'Your package is out for delivery and will arrive today',
        date: new Date(orderDate.getTime() + 72 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '8:00 AM',
        completed: false,
        current: false
      },
      {
        id: '5',
        title: 'Delivered',
        description: 'Your package has been successfully delivered',
        date: estimatedDelivery.toISOString().split('T')[0],
        time: '4:00 PM',
        completed: false,
        current: false
      }
    ];

    return { order, tracking };
  }
  getStatusColor(status: string): string {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'Confirmed':
      return 'bg-blue-100 text-blue-700';
    case 'Shipped':
      return 'bg-purple-100 text-purple-700';
    case 'Delivered':
      return 'bg-green-100 text-green-700';
    case 'Cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}
}
