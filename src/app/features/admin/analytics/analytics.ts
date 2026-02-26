import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AdminSidebar } from '../../../shared/admin-sidebar/admin-sidebar';

interface SalesData {
  month: string;
  sales: number;
  orders: number;
  revenue: number;
}

interface TopProduct {
  id: number;
  name: string;
  sales: number;
  revenue: number;
  category: string;
}

interface CustomerSegment {
  segment: string;
  count: number;
  percentage: number;
  avgOrderValue: number;
}

interface CategoryPerformance {
  category: string;
  revenue: number;
  orders: number;
  growth: number;
}

@Component({
  selector: 'app-analytics',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AdminSidebar],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class Analytics implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  selectedPeriod = '30days';
  selectedMetric = 'revenue';
  loading = false;
  
  // Form for date range
  dateRangeForm: FormGroup;
  
  // Analytics data
  salesData: SalesData[] = [];
  topProducts: TopProduct[] = [];
  customerSegments: CustomerSegment[] = [];
  categoryPerformance: CategoryPerformance[] = [];
  
  // Summary metrics
  totalRevenue = 0;
  totalOrders = 0;
  totalCustomers = 0;
  conversionRate = 0;
  avgOrderValue = 0;
  revenueGrowth = 0;
  orderGrowth = 0;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.dateRangeForm = this.fb.group({
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadAnalyticsData(): void {
    this.loading = true;
    
    // TODO: Replace with actual API calls
    Promise.all([
      this.loadSalesData(),
      this.loadTopProducts(),
      this.loadCustomerSegments(),
      this.loadCategoryPerformance(),
      this.loadSummaryMetrics()
    ]).finally(() => {
      this.loading = false;
    });
  }

  loadSalesData(): Promise<void> {
    return new Promise((resolve) => {
      // TODO: Replace with actual API call
      this.http.get<SalesData[]>('/api/admin/analytics/sales').subscribe({
        next: (data) => {
          this.salesData = data;
        },
        error: (error) => {
          console.error('Failed to load sales data:', error);
          // Use mock data for now
          this.salesData = this.getMockSalesData();
        }
      });
      resolve();
    });
  }

  loadTopProducts(): Promise<void> {
    return new Promise((resolve) => {
      // TODO: Replace with actual API call
      this.http.get<TopProduct[]>('/api/admin/analytics/top-products').subscribe({
        next: (data) => {
          this.topProducts = data;
        },
        error: (error) => {
          console.error('Failed to load top products:', error);
          // Use mock data for now
          this.topProducts = this.getMockTopProducts();
        }
      });
      resolve();
    });
  }

  loadCustomerSegments(): Promise<void> {
    return new Promise((resolve) => {
      // TODO: Replace with actual API call
      this.http.get<CustomerSegment[]>('/api/admin/analytics/customer-segments').subscribe({
        next: (data) => {
          this.customerSegments = data;
        },
        error: (error) => {
          console.error('Failed to load customer segments:', error);
          // Use mock data for now
          this.customerSegments = this.getMockCustomerSegments();
        }
      });
      resolve();
    });
  }

  loadCategoryPerformance(): Promise<void> {
    return new Promise((resolve) => {
      // TODO: Replace with actual API call
      this.http.get<CategoryPerformance[]>('/api/admin/analytics/category-performance').subscribe({
        next: (data) => {
          this.categoryPerformance = data;
        },
        error: (error) => {
          console.error('Failed to load category performance:', error);
          // Use mock data for now
          this.categoryPerformance = this.getMockCategoryPerformance();
        }
      });
      resolve();
    });
  }

  loadSummaryMetrics(): Promise<void> {
    return new Promise((resolve) => {
      // TODO: Replace with actual API call
      this.http.get<any>('/api/admin/analytics/summary').subscribe({
        next: (data) => {
          this.totalRevenue = data.totalRevenue;
          this.totalOrders = data.totalOrders;
          this.totalCustomers = data.totalCustomers;
          this.conversionRate = data.conversionRate;
          this.avgOrderValue = data.avgOrderValue;
          this.revenueGrowth = data.revenueGrowth;
          this.orderGrowth = data.orderGrowth;
        },
        error: (error) => {
          console.error('Failed to load summary metrics:', error);
          // Use mock data for now
          const mockData = this.getMockSummaryMetrics();
          Object.assign(this, mockData);
        }
      });
      resolve();
    });
  }

  onPeriodChange(): void {
    this.loadAnalyticsData();
  }

  onMetricChange(): void {
    // Update charts based on selected metric
  }

  onDateRangeSubmit(): void {
    if (this.dateRangeForm.valid) {
      this.loadAnalyticsData();
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  exportAnalytics(): void {
    // TODO: Implement analytics export functionality
    console.log('Export analytics functionality not implemented yet');
  }

  refreshData(): void {
    this.loadAnalyticsData();
  }

  // Mock data methods
  getMockSalesData(): SalesData[] {
    return [
      { month: 'Jan', sales: 145, orders: 89, revenue: 23450 },
      { month: 'Feb', sales: 189, orders: 112, revenue: 31200 },
      { month: 'Mar', sales: 234, orders: 145, revenue: 38900 },
      { month: 'Apr', sales: 198, orders: 123, revenue: 32100 },
      { month: 'May', sales: 267, orders: 167, revenue: 44500 },
      { month: 'Jun', sales: 312, orders: 198, revenue: 52300 },
      { month: 'Jul', sales: 289, orders: 178, revenue: 48900 },
      { month: 'Aug', sales: 334, orders: 212, revenue: 56700 },
      { month: 'Sep', sales: 298, orders: 189, revenue: 49800 },
      { month: 'Oct', sales: 367, orders: 234, revenue: 61200 },
      { month: 'Nov', sales: 412, orders: 267, revenue: 68900 },
      { month: 'Dec', sales: 456, orders: 289, revenue: 75600 }
    ];
  }

  getMockTopProducts(): TopProduct[] {
    return [
      { id: 1, name: 'Wireless Headphones', sales: 234, revenue: 46800, category: 'Electronics' },
      { id: 2, name: 'Smart Watch', sales: 189, revenue: 56700, category: 'Electronics' },
      { id: 3, name: 'Running Shoes', sales: 167, revenue: 25050, category: 'Sports' },
      { id: 4, name: 'Yoga Mat', sales: 145, revenue: 7250, category: 'Sports' },
      { id: 5, name: 'Coffee Maker', sales: 123, revenue: 24600, category: 'Home' }
    ];
  }

  getMockCustomerSegments(): CustomerSegment[] {
    return [
      { segment: 'New Customers', count: 1234, percentage: 35, avgOrderValue: 89 },
      { segment: 'Returning Customers', count: 1567, percentage: 45, avgOrderValue: 156 },
      { segment: 'VIP Customers', count: 445, percentage: 13, avgOrderValue: 289 },
      { segment: 'Inactive Customers', count: 234, percentage: 7, avgOrderValue: 45 }
    ];
  }

  getMockCategoryPerformance(): CategoryPerformance[] {
    return [
      { category: 'Electronics', revenue: 125000, orders: 567, growth: 15.3 },
      { category: 'Clothing', revenue: 89000, orders: 445, growth: 8.7 },
      { category: 'Home & Garden', revenue: 67000, orders: 234, growth: -2.1 },
      { category: 'Sports', revenue: 45000, orders: 189, growth: 12.4 },
      { category: 'Books', revenue: 34000, orders: 156, growth: 5.6 }
    ];
  }

  getMockSummaryMetrics() {
    return {
      totalRevenue: 456789,
      totalOrders: 2345,
      totalCustomers: 3456,
      conversionRate: 3.4,
      avgOrderValue: 194.67,
      revenueGrowth: 12.5,
      orderGrowth: 8.3
    };
  }

  // Helper methods for formatting
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getGrowthClass(growth: number): string {
    return growth >= 0 ? 'positive' : 'negative';
  }

  getGrowthIcon(growth: number): string {
    return growth >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  }
}
