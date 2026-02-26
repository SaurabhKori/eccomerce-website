import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AdminSidebar } from '../../../shared/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, AdminSidebar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  showNotifications = false;
  showUserMenu = false;
  
  // Dashboard Stats
  totalRevenue = 125430;
  totalOrders = 1847;
  totalCustomers = 3291;
  totalProducts = 486;
  pendingOrders = 23;
  
  // Notifications
  unreadNotifications = 5;
  notifications = [
    {
      id: 1,
      message: 'New order #1848 received',
      icon: 'fas fa-shopping-cart',
      time: '2 minutes ago',
      read: false
    },
    {
      id: 2,
      message: 'Product "Wireless Headphones" is out of stock',
      icon: 'fas fa-exclamation-triangle',
      time: '15 minutes ago',
      read: false
    },
    {
      id: 3,
      message: 'New customer registration: John Doe',
      icon: 'fas fa-user-plus',
      time: '1 hour ago',
      read: false
    },
    {
      id: 4,
      message: 'Payment received for order #1845',
      icon: 'fas fa-dollar-sign',
      time: '2 hours ago',
      read: false
    },
    {
      id: 5,
      message: 'System maintenance scheduled for tonight',
      icon: 'fas fa-tools',
      time: '3 hours ago',
      read: false
    }
  ];
  
  // Current User
  currentUser = {
    name: 'Admin User',
    avatar: 'https://picsum.photos/seed/admin/40/40.jpg'
  };
  
  // Top Products
  topProducts = [
    {
      id: 1,
      name: 'Wireless Headphones',
      image: 'https://picsum.photos/seed/headphones/50/50.jpg',
      sales: 234,
      revenue: 23400
    },
    {
      id: 2,
      name: 'Smart Watch',
      image: 'https://picsum.photos/seed/watch/50/50.jpg',
      sales: 189,
      revenue: 37800
    },
    {
      id: 3,
      name: 'Laptop Stand',
      image: 'https://picsum.photos/seed/stand/50/50.jpg',
      sales: 156,
      revenue: 7800
    },
    {
      id: 4,
      name: 'USB-C Hub',
      image: 'https://picsum.photos/seed/hub/50/50.jpg',
      sales: 143,
      revenue: 5720
    },
    {
      id: 5,
      name: 'Bluetooth Speaker',
      image: 'https://picsum.photos/seed/speaker/50/50.jpg',
      sales: 128,
      revenue: 6400
    }
  ];
  
  // Recent Orders
  recentOrders = [
    {
      id: 1847,
      customer: {
        name: 'Alice Johnson',
        avatar: 'https://picsum.photos/seed/alice/40/40.jpg'
      },
      productCount: 3,
      total: 289.99,
      status: 'pending',
      date: new Date('2024-01-15T10:30:00')
    },
    {
      id: 1846,
      customer: {
        name: 'Bob Smith',
        avatar: 'https://picsum.photos/seed/bob/40/40.jpg'
      },
      productCount: 1,
      total: 129.99,
      status: 'processing',
      date: new Date('2024-01-15T09:15:00')
    },
    {
      id: 1845,
      customer: {
        name: 'Carol White',
        avatar: 'https://picsum.photos/seed/carol/40/40.jpg'
      },
      productCount: 2,
      total: 456.78,
      status: 'shipped',
      date: new Date('2024-01-15T08:45:00')
    },
    {
      id: 1844,
      customer: {
        name: 'David Brown',
        avatar: 'https://picsum.photos/seed/david/40/40.jpg'
      },
      productCount: 4,
      total: 789.50,
      status: 'delivered',
      date: new Date('2024-01-14T16:20:00')
    },
    {
      id: 1843,
      customer: {
        name: 'Emma Davis',
        avatar: 'https://picsum.photos/seed/emma/40/40.jpg'
      },
      productCount: 2,
      total: 234.99,
      status: 'delivered',
      date: new Date('2024-01-14T14:10:00')
    }
  ];

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.setupClickOutsideListeners();
  }

  ngOnDestroy(): void {
    this.removeClickOutsideListeners();
  }

  private loadDashboardData(): void {
    // TODO: Replace with actual API calls
    this.http.get('/api/admin/dashboard/stats').subscribe({
      next: (data: any) => {
        // Update dashboard stats
        this.totalRevenue = data.totalRevenue;
        this.totalOrders = data.totalOrders;
        this.totalCustomers = data.totalCustomers;
        this.totalProducts = data.totalProducts;
        this.pendingOrders = data.pendingOrders;
      },
      error: (error) => {
        console.error('Failed to load dashboard data:', error);
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.unreadNotifications = 0;
  }

  onSearch(event: any): void {
    const searchTerm = event.target.value;
    // TODO: Implement search functionality
    console.log('Searching for:', searchTerm);
  }

  onChartFilterChange(event: any): void {
    const filter = event.target.value;
    // TODO: Update chart based on filter
    console.log('Chart filter changed to:', filter);
  }

  viewOrder(orderId: number): void {
    this.router.navigate(['/admin/orders', orderId]);
  }

  logout(): void {
    // TODO: Implement logout logic
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  private setupClickOutsideListeners(): void {
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  private removeClickOutsideListeners(): void {
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  private handleClickOutside(event: Event): void {
    const target = event.target as Element;
    
    // Close notifications if clicking outside
    if (!target.closest('.notifications')) {
      this.showNotifications = false;
    }
    
    // Close user menu if clicking outside
    if (!target.closest('.user-menu')) {
      this.showUserMenu = false;
    }
  }
}
