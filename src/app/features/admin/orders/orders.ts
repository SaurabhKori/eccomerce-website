import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AdminSidebar } from '../../../shared/admin-sidebar/admin-sidebar';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
}

interface OrderProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: number;
  customer: Customer;
  products: OrderProduct[];
  total: number;
  discount?: number;
  shipping: number;
  tax: number;
  subtotal: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: Date;
  paymentMethod: string;
}

@Component({
  selector: 'app-orders',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AdminSidebar],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  searchTerm = '';
  selectedStatus = '';
  selectedDateRange = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  pendingOrders = 0;
  
  // Modal states
  showOrderModal = false;
  selectedOrder: Order | null = null;
  
  // Data
  orders: Order[] = [];

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {}

  get filteredOrders(): Order[] {
    let filtered = this.orders;
    
    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toString().includes(this.searchTerm) ||
        order.customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (this.selectedStatus) {
      filtered = filtered.filter(order => order.status === this.selectedStatus);
    }
    
    // Filter by date range
    if (this.selectedDateRange) {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date);
        switch (this.selectedDateRange) {
          case 'today':
            return orderDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return orderDate >= monthAgo;
          case 'year':
            const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            return orderDate >= yearAgo;
          default:
            return true;
        }
      });
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Pagination
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    return filtered.slice(startIndex, endIndex);
  }

  get totalRevenue(): number {
    return this.filteredOrders.reduce((sum, order) => sum + order.total, 0);
  }

  calculatePendingOrders(): void {
    this.pendingOrders = this.orders.filter(order => order.status === 'pending').length;
  }

  loadOrders(): void {
    // TODO: Replace with actual API call
    this.http.get<Order[]>('/api/admin/orders').subscribe({
      next: (data) => {
        this.orders = data;
        this.calculatePendingOrders();
      },
      error: (error) => {
        console.error('Failed to load orders:', error);
        // Load mock data for demo
        this.orders = this.getMockOrders();
        this.calculatePendingOrders();
      }
    });
  }

  getMockOrders(): Order[] {
    return [
      {
        id: 1847,
        customer: {
          id: 1,
          name: 'Alice Johnson',
          email: 'alice@example.com',
          phone: '+1 (555) 123-4567',
          address: '123 Main St, City, State 12345',
          avatar: 'https://picsum.photos/seed/alice/50/50.jpg'
        },
        products: [
          {
            id: 1,
            name: 'Wireless Headphones',
            category: 'Electronics',
            price: 89.99,
            quantity: 1,
            image: 'https://picsum.photos/seed/headphones/50/50.jpg'
          },
          {
            id: 2,
            name: 'Phone Case',
            category: 'Accessories',
            price: 19.99,
            quantity: 2,
            image: 'https://picsum.photos/seed/case/50/50.jpg'
          }
        ],
        total: 129.97,
        shipping: 9.99,
        tax: 10.40,
        subtotal: 129.97,
        status: 'pending',
        date: new Date('2024-01-15T10:30:00'),
        paymentMethod: 'Credit Card'
      },
      {
        id: 1846,
        customer: {
          id: 2,
          name: 'Bob Smith',
          email: 'bob@example.com',
          phone: '+1 (555) 987-6543',
          address: '456 Oak Ave, Town, State 67890',
          avatar: 'https://picsum.photos/seed/bob/50/50.jpg'
        },
        products: [
          {
            id: 3,
            name: 'Smart Watch',
            category: 'Electronics',
            price: 199.99,
            quantity: 1,
            image: 'https://picsum.photos/seed/watch/50/50.jpg'
          }
        ],
        total: 219.98,
        discount: 20.00,
        shipping: 0.00,
        tax: 16.00,
        subtotal: 239.98,
        status: 'processing',
        date: new Date('2024-01-15T09:15:00'),
        paymentMethod: 'PayPal'
      },
      {
        id: 1845,
        customer: {
          id: 3,
          name: 'Carol White',
          email: 'carol@example.com',
          phone: '+1 (555) 246-8135',
          address: '789 Pine Rd, Village, State 13579',
          avatar: 'https://picsum.photos/seed/carol/50/50.jpg'
        },
        products: [
          {
            id: 4,
            name: 'Running Shoes',
            category: 'Sports',
            price: 79.99,
            quantity: 1,
            image: 'https://picsum.photos/seed/shoes/50/50.jpg'
          },
          {
            id: 5,
            name: 'Sports Socks',
            category: 'Sports',
            price: 12.99,
            quantity: 3,
            image: 'https://picsum.photos/seed/socks/50/50.jpg'
          }
        ],
        total: 118.96,
        shipping: 7.99,
        tax: 9.52,
        subtotal: 118.96,
        status: 'shipped',
        date: new Date('2024-01-15T08:45:00'),
        paymentMethod: 'Apple Pay'
      },
      {
        id: 1844,
        customer: {
          id: 4,
          name: 'David Brown',
          email: 'david@example.com',
          phone: '+1 (555) 369-2580',
          address: '321 Elm St, City, State 24680',
          avatar: 'https://picsum.photos/seed/david/50/50.jpg'
        },
        products: [
          {
            id: 6,
            name: 'Coffee Maker',
            category: 'Home & Garden',
            price: 149.99,
            quantity: 1,
            image: 'https://picsum.photos/seed/coffee/50/50.jpg'
          },
          {
            id: 7,
            name: 'Coffee Beans',
            category: 'Food & Beverage',
            price: 24.99,
            quantity: 2,
            image: 'https://picsum.photos/seed/beans/50/50.jpg'
          }
        ],
        total: 199.97,
        shipping: 12.99,
        tax: 16.00,
        subtotal: 199.97,
        status: 'delivered',
        date: new Date('2024-01-14T16:20:00'),
        paymentMethod: 'Credit Card'
      },
      {
        id: 1843,
        customer: {
          id: 5,
          name: 'Emma Davis',
          email: 'emma@example.com',
          phone: '+1 (555) 147-2589',
          address: '654 Maple Dr, Town, State 97531',
          avatar: 'https://picsum.photos/seed/emma/50/50.jpg'
        },
        products: [
          {
            id: 8,
            name: 'Yoga Mat',
            category: 'Sports',
            price: 29.99,
            quantity: 1,
            image: 'https://picsum.photos/seed/yoga/50/50.jpg'
          }
        ],
        total: 32.99,
        shipping: 5.99,
        tax: 2.64,
        subtotal: 29.99,
        status: 'delivered',
        date: new Date('2024-01-14T14:10:00'),
        paymentMethod: 'Google Pay'
      }
    ];
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.currentPage = 1;
  }

  onStatusChange(): void {
    this.currentPage = 1;
  }

  onDateRangeChange(): void {
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, this.totalPages - maxVisible + 1);
      end = this.totalPages;
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  viewOrder(orderId: number): void {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      this.selectedOrder = order;
      this.showOrderModal = true;
    }
  }

  editOrder(orderId: number): void {
    // TODO: Implement order editing functionality
    console.log('Edit order:', orderId);
  }

  deleteOrder(orderId: number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      // TODO: Replace with actual API call
      this.http.delete(`/api/admin/orders/${orderId}`).subscribe({
        next: () => {
          this.orders = this.orders.filter(o => o.id !== orderId);
        },
        error: (error) => {
          console.error('Failed to delete order:', error);
          alert('Failed to delete order. Please try again.');
        }
      });
    }
  }

  exportOrders(): void {
    // TODO: Implement export functionality
    console.log('Export orders with filters:', {
      status: this.selectedStatus,
      dateRange: this.selectedDateRange,
      searchTerm: this.searchTerm
    });
  }

  closeOrderModal(): void {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }

  closeModalOnOverlay(event: Event): void {
    const target = event.target as Element;
    if (target.classList.contains('modal-overlay')) {
      this.closeOrderModal();
    }
  }

  printOrder(): void {
    // TODO: Implement print functionality
    window.print();
  }
}
