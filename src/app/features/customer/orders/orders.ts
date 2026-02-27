import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { Navbar } from '../../../shared/components/navbar/navbar';

interface Order {
  id: string;
  orderDate: string;
  deliveryDate: string;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
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
  selector: 'app-orders',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Navbar],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  sidebarCollapsed = false;
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = false;
  filterForm: FormGroup;
  selectedStatus = '';
  
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
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      search: [''],
      dateRange: ['']
    });
  }

  ngOnInit(): void {
    this.loadOrders();
    
    // Listen to form changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadOrders(): void {
    this.loading = true;
    this.http.get<Order[]>('/api/orders').subscribe({
      next: (orders) => {
        this.orders = orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        this.filteredOrders = this.orders;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
        this.orders = this.generateMockOrders();
        this.filteredOrders = this.orders;
      }
    });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    
    this.filteredOrders = this.orders.filter(order => {
      // Status filter
      if (filters.status && order.status !== filters.status) {
        return false;
      }
      
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const orderMatch = order.id.toLowerCase().includes(searchTerm);
        const itemMatch = order.items.some(item => 
          item.name.toLowerCase().includes(searchTerm)
        );
        if (!orderMatch && !itemMatch) {
          return false;
        }
      }
      
      return true;
    });
  }

  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }

  trackOrder(orderId: string): void {
    this.router.navigate(['/orders', orderId, 'track']);
  }

  cancelOrder(orderId: string): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.http.patch(`/api/orders/${orderId}/cancel`, {}).subscribe({
        next: () => {
          const order = this.orders.find(o => o.id === orderId);
          if (order) {
            order.status = 'Cancelled';
          }
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          alert('Failed to cancel order. Please try again.');
        }
      });
    }
  }

  returnOrder(orderId: string): void {
    this.router.navigate(['/orders', orderId, 'return']);
  }

  reorderItems(order: Order): void {
    // Add all items from the order to cart
    const productIds = order.items.map(item => item.id);
    
    this.http.post('/api/cart/add-multiple', { productIds }).subscribe({
      next: () => {
        alert('Items added to cart!');
        this.router.navigate(['/cart']);
      },
      error: (error) => {
        console.error('Error adding items to cart:', error);
        alert('Failed to add items to cart. Please try again.');
      }
    });
  }

  downloadInvoice(orderId: string): void {
    window.open(`/api/orders/${orderId}/invoice`, '_blank');
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'confirmed':
        return 'status-confirmed';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'fas fa-clock';
      case 'confirmed':
        return 'fas fa-check-circle';
      case 'shipped':
        return 'fas fa-truck';
      case 'delivered':
        return 'fas fa-check-double';
      case 'cancelled':
        return 'fas fa-times-circle';
      default:
        return 'fas fa-question-circle';
    }
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
  formatCurrency(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  private generateMockOrders(): Order[] {
    const statuses: Order['status'][] = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
    const orders: Order[] = [];
    
    for (let i = 1; i <= 10; i++) {
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - (i * 2)); // Orders from different dates
      
      const deliveryDate = new Date(orderDate);
      deliveryDate.setDate(deliveryDate.getDate() + 5);
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      orders.push({
        id: `ORD-2024-${String(i).padStart(4, '0')}`,
        orderDate: orderDate.toISOString(),
        deliveryDate: deliveryDate.toISOString(),
        status,
        total: Math.floor(Math.random() * 500) + 100,
        items: [
          {
            id: i * 10 + 1,
            name: `Product ${i * 10 + 1}`,
            image: `https://via.placeholder.com/100x100?text=Product+${i * 10 + 1}`,
            price: Math.floor(Math.random() * 100) + 20,
            quantity: Math.floor(Math.random() * 3) + 1
          },
          {
            id: i * 10 + 2,
            name: `Product ${i * 10 + 2}`,
            image: `https://via.placeholder.com/100x100?text=Product+${i * 10 + 2}`,
            price: Math.floor(Math.random() * 100) + 20,
            quantity: Math.floor(Math.random() * 2) + 1
          }
        ],
        shippingAddress: {
          name: 'John Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        }
      });
    }
    
    return orders;
  }
  routes(route:any) {
    this.router.navigate([`${route}`]);
  }
}
