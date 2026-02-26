import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { NavItem } from '../../../shared/components/sidebar/sidebar';

interface SellerOrder {
  id: number;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    avatar: string;
  };
  products: SellerOrderProduct[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount?: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderDate: Date;
  shippingDate?: Date;
  deliveredDate?: Date;
  trackingNumber?: string;
  notes?: string;
}

interface SellerOrderProduct {
  id: number;
  name: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

@Component({
  selector: 'app-seller-orders',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Sidebar],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class SellerOrders implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  searchTerm = '';
  selectedStatus = '';
  selectedDateRange = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  // Navigation items for sidebar
  navItems: NavItem[] = [
    { path: '/seller/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/seller/products', label: 'Products', icon: 'fas fa-box' },
    { path: '/seller/orders', label: 'Orders', icon: 'fas fa-shopping-cart' },
    { path: '/seller/analytics', label: 'Analytics', icon: 'fas fa-chart-line' },
    { path: '/seller/reviews', label: 'Reviews', icon: 'fas fa-star' },
    { path: '/seller/settings', label: 'Settings', icon: 'fas fa-cog' }
  ];
  
  // Modal states
  showOrderModal = false;
  selectedOrder: SellerOrder | null = null;
  
  // Forms
  trackingForm: FormGroup;
  notesForm: FormGroup;
  
  // Data
  orders: SellerOrder[] = [];
  filteredOrders: SellerOrder[] = [];
  orderStats: OrderStats = {
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0
  };
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.trackingForm = this.fb.group({
      trackingNumber: ['']
    });
    
    this.notesForm = this.fb.group({
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadOrders(): void {
    // TODO: Replace with actual API call
    this.http.get<SellerOrder[]>('/api/seller/orders').subscribe({
      next: (data) => {
        this.orders = data;
        this.applyFilters();
        this.calculateStats();
      },
      error: (error) => {
        console.error('Failed to load orders:', error);
        // Use mock data for now
        this.orders = this.getMockOrders();
        this.applyFilters();
        this.calculateStats();
      }
    });
  }

  applyFilters(): void {
    let filtered = this.orders;
    
    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toString().includes(this.searchTerm) ||
        order.customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.products.some(p => p.name.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }
    
    // Filter by status
    if (this.selectedStatus) {
      filtered = filtered.filter(order => order.status === this.selectedStatus);
    }
    
    // Filter by date range
    if (this.selectedDateRange) {
      const now = new Date();
      let startDate: Date;
      
      switch (this.selectedDateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear() - 1, 0, 1);
          break;
        default:
          startDate = new Date(0);
      }
      
      filtered = filtered.filter(order => order.orderDate >= startDate);
    }
    
    this.filteredOrders = filtered;
    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  calculateStats(): void {
    this.orderStats = {
      totalOrders: this.orders.length,
      pendingOrders: this.orders.filter(o => o.status === 'pending').length,
      processingOrders: this.orders.filter(o => o.status === 'processing').length,
      shippedOrders: this.orders.filter(o => o.status === 'shipped').length,
      deliveredOrders: this.orders.filter(o => o.status === 'delivered').length,
      cancelledOrders: this.orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: this.orders.reduce((sum, order) => sum + order.total, 0),
      avgOrderValue: this.orders.length > 0 ? this.orders.reduce((sum, order) => sum + order.total, 0) / this.orders.length : 0
    };
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onDateRangeChange(): void {
    this.applyFilters();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  viewOrder(orderId: number): void {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      this.selectedOrder = order;
      this.showOrderModal = true;
    }
  }

  closeOrderModal(): void {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }

  closeModalOnOverlay(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay')) {
      this.closeOrderModal();
    }
  }

  updateOrderStatus(orderId: number, status: string): void {
    this.http.patch(`/api/seller/orders/${orderId}`, { status }).subscribe({
      next: () => {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
          order.status = status as SellerOrder['status'];
          if (status === 'shipped') {
            order.shippingDate = new Date();
          } else if (status === 'delivered') {
            order.deliveredDate = new Date();
          }
          this.applyFilters();
          this.calculateStats();
        }
      },
      error: (error) => {
        console.error('Failed to update order status:', error);
        alert('Failed to update order status. Please try again.');
      }
    });
  }

  addTrackingNumber(): void {
    if (this.trackingForm.valid && this.selectedOrder) {
      const trackingNumber = this.trackingForm.value.trackingNumber;
      
      this.http.patch(`/api/seller/orders/${this.selectedOrder.id}`, { trackingNumber }).subscribe({
        next: () => {
          if (this.selectedOrder) {
            this.selectedOrder.trackingNumber = trackingNumber;
          }
          this.trackingForm.reset();
        },
        error: (error) => {
          console.error('Failed to add tracking number:', error);
          alert('Failed to add tracking number. Please try again.');
        }
      });
    }
  }

  addNotes(): void {
    if (this.notesForm.valid && this.selectedOrder) {
      const notes = this.notesForm.value.notes;
      
      this.http.patch(`/api/seller/orders/${this.selectedOrder.id}`, { notes }).subscribe({
        next: () => {
          if (this.selectedOrder) {
            this.selectedOrder.notes = notes;
          }
          this.notesForm.reset();
        },
        error: (error) => {
          console.error('Failed to add notes:', error);
          alert('Failed to add notes. Please try again.');
        }
      });
    }
  }

  refundOrder(orderId: number): void {
    if (confirm('Are you sure you want to refund this order?')) {
      this.http.post(`/api/seller/orders/${orderId}/refund`, {}).subscribe({
        next: () => {
          this.updateOrderStatus(orderId, 'refunded');
        },
        error: (error) => {
          console.error('Failed to refund order:', error);
          alert('Failed to refund order. Please try again.');
        }
      });
    }
  }

  cancelOrder(orderId: number): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.http.post(`/api/seller/orders/${orderId}/cancel`, {}).subscribe({
        next: () => {
          this.updateOrderStatus(orderId, 'cancelled');
        },
        error: (error) => {
          console.error('Failed to cancel order:', error);
          alert('Failed to cancel order. Please try again.');
        }
      });
    }
  }

  printOrder(orderId: number): void {
    // TODO: Implement order printing functionality
    console.log('Print order functionality not implemented yet');
  }

  exportOrders(): void {
    // TODO: Implement order export functionality
    console.log('Export orders functionality not implemented yet');
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(this.totalPages, start + maxVisible - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  get paginatedOrders(): SellerOrder[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredOrders.slice(start, end);
  }

  // Mock data methods
  getMockOrders(): SellerOrder[] {
    return [
      {
        id: 1001,
        customer: {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          address: '123 Main St, New York, NY 10001',
          avatar: 'https://picsum.photos/seed/customer1/200/200.jpg'
        },
        products: [
          {
            id: 1,
            name: 'Wireless Headphones',
            sku: 'WBH-001',
            image: 'https://picsum.photos/seed/headphones/100/100.jpg',
            price: 199.99,
            quantity: 1,
            total: 199.99
          },
          {
            id: 2,
            name: 'Phone Case',
            sku: 'PC-001',
            image: 'https://picsum.photos/seed/case/100/100.jpg',
            price: 19.99,
            quantity: 2,
            total: 39.98
          }
        ],
        total: 239.97,
        subtotal: 239.97,
        tax: 19.20,
        shipping: 9.99,
        status: 'pending',
        paymentMethod: 'Credit Card',
        paymentStatus: 'paid',
        orderDate: new Date('2024-01-20T10:30:00'),
        notes: 'Customer requested gift wrapping'
      },
      {
        id: 1002,
        customer: {
          id: 2,
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+1 (555) 987-6543',
          address: '456 Oak Ave, Los Angeles, CA 90001',
          avatar: 'https://picsum.photos/seed/customer2/200/200.jpg'
        },
        products: [
          {
            id: 2,
            name: 'Smart Watch',
            sku: 'SFW-002',
            image: 'https://picsum.photos/seed/watch/100/100.jpg',
            price: 299.99,
            quantity: 1,
            total: 299.99
          }
        ],
        total: 299.99,
        subtotal: 299.99,
        tax: 24.00,
        shipping: 12.50,
        status: 'processing',
        paymentMethod: 'PayPal',
        paymentStatus: 'paid',
        orderDate: new Date('2024-01-19T14:15:00'),
        trackingNumber: 'US1234567890'
      },
      {
        id: 1003,
        customer: {
          id: 3,
          name: 'Bob Johnson',
          email: 'bob.johnson@example.com',
          phone: '+1 (555) 456-7890',
          address: '789 Pine Rd, Chicago, IL 60007',
          avatar: 'https://picsum.photos/seed/customer3/200/200.jpg'
        },
        products: [
          {
            id: 3,
            name: 'T-Shirt',
            sku: 'OCT-003',
            image: 'https://picsum.photos/seed/tshirt/100/100.jpg',
            price: 29.99,
            quantity: 3,
            total: 89.97
          }
        ],
        total: 89.97,
        subtotal: 89.97,
        tax: 7.20,
        shipping: 8.50,
        status: 'shipped',
        paymentMethod: 'Credit Card',
        paymentStatus: 'paid',
        orderDate: new Date('2024-01-18T16:45:00'),
        shippingDate: new Date('2024-01-19T09:00:00'),
        trackingNumber: 'US1234567891'
      },
      {
        id: 1004,
        customer: {
          id: 4,
          name: 'Alice Brown',
          email: 'alice.brown@example.com',
          phone: '+1 (555) 321-6549',
          address: '321 Elm St, Houston, TX 77001',
          avatar: 'https://picsum.photos/seed/customer4/200/200.jpg'
        },
        products: [
          {
            id: 4,
            name: 'Water Bottle',
            sku: 'SSB-004',
            image: 'https://picsum.photos/seed/bottle/100/100.jpg',
            price: 24.99,
            quantity: 2,
            total: 49.98
          }
        ],
        total: 49.98,
        subtotal: 49.98,
        tax: 4.00,
        shipping: 7.50,
        status: 'delivered',
        paymentMethod: 'Credit Card',
        paymentStatus: 'paid',
        orderDate: new Date('2024-01-17T14:20:00'),
        shippingDate: new Date('2024-01-18T11:00:00'),
        deliveredDate: new Date('2024-01-19T15:30:00')
      },
      {
        id: 1005,
        customer: {
          id: 5,
          name: 'Charlie Davis',
          email: 'charlie.davis@example.com',
          phone: '+1 (555) 654-3210',
          address: '654 Maple Dr, Phoenix, AZ 85001',
          avatar: 'https://picsum.photos/seed/customer5/200/200.jpg'
        },
        products: [
          {
            id: 5,
            name: 'Phone Charger',
            sku: 'WPC-005',
            image: 'https://picsum.photos/seed/charger/100/100.jpg',
            price: 39.99,
            quantity: 1,
            total: 39.99
          }
        ],
        total: 39.99,
        subtotal: 39.99,
        tax: 3.20,
        shipping: 6.00,
        status: 'cancelled',
        paymentMethod: 'Credit Card',
        paymentStatus: 'refunded',
        orderDate: new Date('2024-01-16T12:30:00')
      }
    ];
  }

  // Helper methods
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'pending';
      case 'processing': return 'processing';
      case 'shipped': return 'shipped';
      case 'delivered': return 'delivered';
      case 'cancelled': return 'cancelled';
      case 'refunded': return 'refunded';
      default: return '';
    }
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'paid': return 'paid';
      case 'pending': return 'pending';
      case 'failed': return 'failed';
      case 'refunded': return 'refunded';
      default: return '';
    }
  }
}
