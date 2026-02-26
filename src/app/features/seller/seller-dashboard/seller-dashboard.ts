import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { NavItem } from '../../../shared/components/sidebar/sidebar';

interface SalesData {
  month: string;
  sales: number;
  revenue: number;
  orders: number;
}

interface TopProduct {
  id: number;
  name: string;
  image: string;
  sales: number;
  revenue: number;
  stock: number;
  status: 'active' | 'inactive' | 'out-of-stock';
}

interface RecentOrder {
  id: number;
  customerName: string;
  customerEmail: string;
  products: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: Date;
}

interface SellerStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  avgOrderValue: number;
  conversionRate: number;
  customerRating: number;
}

@Component({
  selector: 'app-seller-dashboard',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Sidebar],
  templateUrl: './seller-dashboard.html',
  styleUrl: './seller-dashboard.css',
})
export class SellerDashboard implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  loading = false;
  
  // Navigation items for sidebar
  navItems: NavItem[] = [
    { path: '/seller/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/seller/products', label: 'Products', icon: 'fas fa-box' },
    { path: '/seller/orders', label: 'Orders', icon: 'fas fa-shopping-cart' },
    { path: '/seller/analytics', label: 'Analytics', icon: 'fas fa-chart-line' },
    { path: '/seller/reviews', label: 'Reviews', icon: 'fas fa-star' },
    { path: '/seller/settings', label: 'Settings', icon: 'fas fa-cog' }
  ];
  
  // Forms
  quickAddForm: FormGroup;
  
  // Dashboard data
  sellerStats: SellerStats = {
    totalRevenue: 45678,
    totalOrders: 234,
    totalProducts: 45,
    avgOrderValue: 195.12,
    conversionRate: 3.2,
    customerRating: 4.6
  };
  
  salesData: SalesData[] = [];
  topProducts: TopProduct[] = [];
  recentOrders: RecentOrder[] = [];
  
  // Notifications
  notifications = [
    {
      id: 1,
      message: 'New order received',
      type: 'order',
      time: '2 minutes ago',
      read: false
    },
    {
      id: 2,
      message: 'Product "Wireless Headphones" is low on stock',
      type: 'inventory',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      message: 'Customer review received',
      type: 'review',
      time: '3 hours ago',
      read: true
    }
  ];
  
  unreadNotifications = 2;
  showNotifications = false;
  showUserMenu = false;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.quickAddForm = this.fb.group({
      productName: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // TODO: Replace with actual API calls
    Promise.all([
      this.loadSalesData(),
      this.loadTopProducts(),
      this.loadRecentOrders()
    ]).finally(() => {
      this.loading = false;
    });
  }

  loadSalesData(): void {
    // TODO: Replace with actual API call
    this.http.get<SalesData[]>('/api/seller/dashboard/sales').subscribe({
      next: (data) => {
        this.salesData = data;
      },
      error: (error) => {
        console.error('Failed to load sales data:', error);
        // Use mock data for now
        this.salesData = this.getMockSalesData();
      }
    });
  }

  loadTopProducts(): void {
    // TODO: Replace with actual API call
    this.http.get<TopProduct[]>('/api/seller/dashboard/top-products').subscribe({
      next: (data) => {
        this.topProducts = data;
      },
      error: (error) => {
        console.error('Failed to load top products:', error);
        // Use mock data for now
        this.topProducts = this.getMockTopProducts();
      }
    });
  }

  loadRecentOrders(): void {
    // TODO: Replace with actual API call
    this.http.get<RecentOrder[]>('/api/seller/dashboard/recent-orders').subscribe({
      next: (data) => {
        this.recentOrders = data;
      },
      error: (error) => {
        console.error('Failed to load recent orders:', error);
        // Use mock data for now
        this.recentOrders = this.getMockRecentOrders();
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.unreadNotifications = 0;
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  quickAddProduct(): void {
    if (this.quickAddForm.valid) {
      const productData = this.quickAddForm.value;
      // TODO: Implement quick add functionality
      console.log('Quick add product:', productData);
      this.quickAddForm.reset();
    }
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/seller/products', productId]);
  }

  viewOrder(orderId: number): void {
    this.router.navigate(['/seller/orders', orderId]);
  }

  markNotificationAsRead(notificationId: number): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  // Mock data methods
  getMockSalesData(): SalesData[] {
    return [
      { month: 'Jan', sales: 45, revenue: 8900, orders: 23 },
      { month: 'Feb', sales: 52, revenue: 10200, orders: 28 },
      { month: 'Mar', sales: 48, revenue: 9400, orders: 25 },
      { month: 'Apr', sales: 61, revenue: 11900, orders: 32 },
      { month: 'May', sales: 58, revenue: 11300, orders: 30 },
      { month: 'Jun', sales: 67, revenue: 13100, orders: 35 }
    ];
  }

  getMockTopProducts(): TopProduct[] {
    return [
      {
        id: 1,
        name: 'Wireless Headphones',
        image: 'https://picsum.photos/seed/headphones/100/100.jpg',
        sales: 234,
        revenue: 23400,
        stock: 45,
        status: 'active'
      },
      {
        id: 2,
        name: 'Smart Watch',
        image: 'https://picsum.photos/seed/watch/100/100.jpg',
        sales: 189,
        revenue: 37800,
        stock: 12,
        status: 'active'
      },
      {
        id: 3,
        name: 'Laptop Stand',
        image: 'https://picsum.photos/seed/stand/100/100.jpg',
        sales: 156,
        revenue: 7800,
        stock: 0,
        status: 'out-of-stock'
      },
      {
        id: 4,
        name: 'USB-C Cable',
        image: 'https://picsum.photos/seed/cable/100/100.jpg',
        sales: 145,
        revenue: 2900,
        stock: 89,
        status: 'active'
      },
      {
        id: 5,
        name: 'Phone Case',
        image: 'https://picsum.photos/seed/case/100/100.jpg',
        sales: 123,
        revenue: 3690,
        stock: 3,
        status: 'active'
      }
    ];
  }

  getMockRecentOrders(): RecentOrder[] {
    return [
      {
        id: 1001,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        products: 2,
        total: 156.78,
        status: 'pending',
        date: new Date('2024-01-15T10:30:00')
      },
      {
        id: 1002,
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        products: 1,
        total: 89.99,
        status: 'processing',
        date: new Date('2024-01-15T09:15:00')
      },
      {
        id: 1003,
        customerName: 'Bob Johnson',
        customerEmail: 'bob@example.com',
        products: 3,
        total: 234.56,
        status: 'shipped',
        date: new Date('2024-01-14T16:45:00')
      },
      {
        id: 1004,
        customerName: 'Alice Brown',
        customerEmail: 'alice@example.com',
        products: 1,
        total: 45.00,
        status: 'delivered',
        date: new Date('2024-01-14T14:20:00')
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
      case 'active': return 'active';
      case 'inactive': return 'inactive';
      case 'out-of-stock': return 'out-of-stock';
      case 'pending': return 'pending';
      case 'processing': return 'processing';
      case 'shipped': return 'shipped';
      case 'delivered': return 'delivered';
      default: return '';
    }
  }

  getRatingStars(rating: number): number[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? 1 : i - 0.5 <= rating ? 0.5 : 0);
    }
    return stars;
  }
}
