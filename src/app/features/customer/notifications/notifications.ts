import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { Navbar } from '../../../shared/components/navbar/navbar';

interface Notification {
  id: number;
  type: 'order' | 'offer' | 'price_drop' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    orderId?: string;
    productId?: number;
    productName?: string;
    discount?: number;
    newPrice?: number;
    oldPrice?: number;
  };
}

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Navbar],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit {
  sidebarCollapsed = false;
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  loading = false;
  
  // Forms
  filterForm: FormGroup;
  
  // UI State
  selectedFilter = 'all';
  markAllLoading = false;
  
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
      search: [''],
      type: ['all']
    });
  }

  ngOnInit(): void {
    // this.loadNotifications();
     this.notifications = this.generateMockNotifications();
        this.filteredNotifications = this.notifications;
    
    // Listen to filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadNotifications(): void {
    this.loading = true;
    this.http.get<Notification[]>('/api/notifications').subscribe({
      next: (notifications) => {
        this.notifications = notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.filteredNotifications = this.notifications;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.loading = false;
        this.notifications = this.generateMockNotifications();
        this.filteredNotifications = this.notifications;
      }
    });
  }

  markAsRead(notificationId: number): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      this.http.patch(`/api/notifications/${notificationId}/read`, {}).subscribe({
        next: () => {
          notification.read = true;
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }
  }

  markAllAsRead(): void {
    if (this.markAllLoading) return;
    
    this.markAllLoading = true;
    const unreadNotifications = this.notifications.filter(n => !n.read);
    
    if (unreadNotifications.length === 0) {
      this.markAllLoading = false;
      return;
    }
    
    this.http.post('/api/notifications/mark-all-read', {}).subscribe({
      next: () => {
        this.notifications.forEach(notification => {
          notification.read = true;
        });
        this.applyFilters();
        this.markAllLoading = false;
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
        this.markAllLoading = false;
      }
    });
  }

  deleteNotification(notificationId: number): void {
    if (confirm('Are you sure you want to delete this notification?')) {
      this.http.delete(`/api/notifications/${notificationId}`).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== notificationId);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
          alert('Failed to delete notification. Please try again.');
        }
      });
    }
  }

  clearAllNotifications(): void {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.http.delete('/api/notifications/clear').subscribe({
        next: () => {
          this.notifications = [];
          this.filteredNotifications = [];
        },
        error: (error) => {
          console.error('Error clearing notifications:', error);
          alert('Failed to clear notifications. Please try again.');
        }
      });
    }
  }

  takeAction(notification: Notification): void {
    // Mark as read
    this.markAsRead(notification.id);
    
    // Navigate to action URL if provided
    if (notification.actionUrl) {
      this.router.navigateByUrl(notification.actionUrl);
    }
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    
    this.filteredNotifications = this.notifications.filter(notification => {
      // Type filter
      if (filters.type && filters.type !== 'all') {
        if (filters.type === 'unread' && notification.read) return false;
        if (filters.type === 'read' && !notification.read) return false;
        if (filters.type === 'order' && notification.type !== 'order') return false;
        if (filters.type === 'offer' && notification.type !== 'offer') return false;
        if (filters.type === 'price_drop' && notification.type !== 'price_drop') return false;
        if (filters.type === 'system' && notification.type !== 'system') return false;
      }
      
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const titleMatch = notification.title.toLowerCase().includes(searchTerm);
        const messageMatch = notification.message.toLowerCase().includes(searchTerm);
        if (!titleMatch && !messageMatch) return false;
      }
      
      return true;
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'order':
        return 'fas fa-shopping-bag';
      case 'offer':
        return 'fas fa-tag';
      case 'price_drop':
        return 'fas fa-arrow-down';
      case 'system':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-bell';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'order':
        return '#007bff';
      case 'offer':
        return '#28a745';
      case 'price_drop':
        return '#ffc107';
      case 'system':
        return '#6c757d';
      default:
        return '#007bff';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  private generateMockNotifications(): Notification[] {
    return [
      {
        id: 1,
        type: 'order',
        title: 'Order Confirmed',
        message: 'Your order #ORD-2024-0001 has been confirmed and is being processed.',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionUrl: '/orders',
        actionText: 'View Order',
        metadata: {
          orderId: 'ORD-2024-0001'
        }
      },
      {
        id: 2,
        type: 'offer',
        title: 'Flash Sale! 50% Off',
        message: 'Limited time offer: Get 50% off on selected electronics. Hurry, offer ends in 24 hours!',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionUrl: '/products?sale=flash',
        actionText: 'Shop Now',
        metadata: {
          discount: 50
        }
      },
      {
        id: 3,
        type: 'price_drop',
        title: 'Price Drop Alert',
        message: 'Wireless Headphones price dropped from $199.99 to $149.99. Save $50 now!',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        actionUrl: '/products/123',
        actionText: 'View Product',
        metadata: {
          productId: 123,
          productName: 'Wireless Headphones',
          oldPrice: 199.99,
          newPrice: 149.99
        }
      },
      {
        id: 4,
        type: 'order',
        title: 'Order Delivered',
        message: 'Your order #ORD-2024-0002 has been successfully delivered. Enjoy your purchase!',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        actionUrl: '/orders/ORD-2024-0002/track',
        actionText: 'Track Order',
        metadata: {
          orderId: 'ORD-2024-0002'
        }
      },
      {
        id: 5,
        type: 'system',
        title: 'Account Security',
        message: 'Your account was accessed from a new device. If this wasn\'t you, please secure your account.',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        actionUrl: '/profile',
        actionText: 'Secure Account',
        metadata: {}
      }
    ];
  }
}
