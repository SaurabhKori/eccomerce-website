import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface SellerSalesData {
  month: string;
  sales: number;
  orders: number;
  revenue: number;
  profit: number;
}

interface SellerTopProduct {
  id: number;
  name: string;
  image: string;
  sales: number;
  revenue: number;
  profit: number;
  rating: number;
  reviews: number;
}

interface SellerCustomerSegment {
  segment: string;
  count: number;
  percentage: number;
  avgOrderValue: number;
  totalSpent: number;
}

interface SellerCategoryPerformance {
  category: string;
  revenue: number;
  orders: number;
  growth: number;
  profit: number;
}

interface SellerAnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  conversionRate: number;
  totalProfit: number;
  profitMargin: number;
  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;
}

@Component({
  selector: 'app-seller-analytics',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class SellerAnalytics implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  selectedPeriod = '30days';
  selectedMetric = 'revenue';
  loading = false;
  
  // Forms
  dateRangeForm: FormGroup;
  
  // Analytics data
  salesData: SellerSalesData[] = [];
  topProducts: SellerTopProduct[] = [];
  customerSegments: SellerCustomerSegment[] = [];
  categoryPerformance: SellerCategoryPerformance[] = [];
  analyticsSummary: SellerAnalyticsSummary = {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    totalProfit: 0,
    profitMargin: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    customerGrowth: 0
  };
  
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
      this.loadAnalyticsSummary()
    ]).finally(() => {
      this.loading = false;
    });
  }

  loadSalesData(): void {
    // TODO: Replace with actual API call
    this.http.get<SellerSalesData[]>('/api/seller/analytics/sales').subscribe({
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
    this.http.get<SellerTopProduct[]>('/api/seller/analytics/top-products').subscribe({
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

  loadCustomerSegments(): void {
    // TODO: Replace with actual API call
    this.http.get<SellerCustomerSegment[]>('/api/seller/analytics/customer-segments').subscribe({
      next: (data) => {
        this.customerSegments = data;
      },
      error: (error) => {
        console.error('Failed to load customer segments:', error);
        // Use mock data for now
        this.customerSegments = this.getMockCustomerSegments();
      }
    });
  }

  loadCategoryPerformance(): void {
    // TODO: Replace with actual API call
    this.http.get<SellerCategoryPerformance[]>('/api/seller/analytics/category-performance').subscribe({
      next: (data) => {
        this.categoryPerformance = data;
      },
      error: (error) => {
        console.error('Failed to load category performance:', error);
        // Use mock data for now
        this.categoryPerformance = this.getMockCategoryPerformance();
      }
    });
  }

  loadAnalyticsSummary(): void {
    // TODO: Replace with actual API call
    this.http.get<SellerAnalyticsSummary>('/api/seller/analytics/summary').subscribe({
      next: (data) => {
        this.analyticsSummary = data;
      },
      error: (error) => {
        console.error('Failed to load analytics summary:', error);
        // Use mock data for now
        this.analyticsSummary = this.getMockAnalyticsSummary();
      }
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
  getMockSalesData(): SellerSalesData[] {
    return [
      { month: 'Jan', sales: 45, orders: 23, revenue: 8900, profit: 2670 },
      { month: 'Feb', sales: 52, orders: 28, revenue: 10200, profit: 3060 },
      { month: 'Mar', sales: 48, orders: 25, revenue: 9400, profit: 2820 },
      { month: 'Apr', sales: 61, orders: 32, revenue: 11900, profit: 3570 },
      { month: 'May', sales: 58, orders: 30, revenue: 11300, profit: 3390 },
      { month: 'Jun', sales: 67, orders: 35, revenue: 13100, profit: 3930 }
    ];
  }

  getMockTopProducts(): SellerTopProduct[] {
    return [
      {
        id: 1,
        name: 'Wireless Headphones',
        image: 'https://picsum.photos/seed/headphones/100/100.jpg',
        sales: 234,
        revenue: 46800,
        profit: 14040,
        rating: 4.5,
        reviews: 89
      },
      {
        id: 2,
        name: 'Smart Watch',
        image: 'https://picsum.photos/seed/watch/100/100.jpg',
        sales: 189,
        revenue: 56700,
        profit: 17010,
        rating: 4.2,
        reviews: 67
      },
      {
        id: 3,
        name: 'T-Shirt',
        image: 'https://picsum.photos/seed/tshirt/100/100.jpg',
        sales: 156,
        revenue: 4680,
        profit: 1404,
        rating: 4.0,
        reviews: 34
      },
      {
        id: 4,
        name: 'Water Bottle',
        image: 'https://picsum.photos/seed/bottle/100/100.jpg',
        sales: 145,
        revenue: 3625,
        profit: 1088,
        rating: 4.7,
        reviews: 45
      },
      {
        id: 5,
        name: 'Phone Charger',
        image: 'https://picsum.photos/seed/charger/100/100.jpg',
        sales: 123,
        revenue: 4920,
        profit: 1476,
        rating: 4.3,
        reviews: 28
      }
    ];
  }

  getMockCustomerSegments(): SellerCustomerSegment[] {
    return [
      { segment: 'New Customers', count: 234, percentage: 35, avgOrderValue: 89, totalSpent: 20826 },
      { segment: 'Returning Customers', count: 345, percentage: 52, avgOrderValue: 156, totalSpent: 53820 },
      { segment: 'VIP Customers', count: 89, percentage: 13, avgOrderValue: 289, totalSpent: 25721 }
    ];
  }

  getMockCategoryPerformance(): SellerCategoryPerformance[] {
    return [
      { category: 'Electronics', revenue: 125000, orders: 567, growth: 15.3, profit: 37500 },
      { category: 'Clothing', revenue: 45000, orders: 234, growth: 8.7, profit: 13500 },
      { category: 'Sports', revenue: 34000, orders: 189, growth: 12.4, profit: 10200 }
    ];
  }

  getMockAnalyticsSummary(): SellerAnalyticsSummary {
    return {
      totalRevenue: 204000,
      totalOrders: 990,
      totalCustomers: 668,
      avgOrderValue: 206.06,
      conversionRate: 3.4,
      totalProfit: 61200,
      profitMargin: 30.0,
      revenueGrowth: 12.5,
      orderGrowth: 8.3,
      customerGrowth: 15.2
    };
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

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getGrowthClass(growth: number): string {
    return growth >= 0 ? 'positive' : 'negative';
  }

  getGrowthIcon(growth: number): string {
    return growth >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  }

  getRatingStars(rating: number): number[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? 1 : i - 0.5 <= rating ? 0.5 : 0);
    }
    return stars;
  }

  getProfitMarginClass(margin: number): string {
    if (margin >= 30) return 'excellent';
    if (margin >= 20) return 'good';
    if (margin >= 10) return 'fair';
    return 'poor';
  }
}
