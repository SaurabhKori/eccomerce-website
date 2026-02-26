import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { NavItem } from '../../../shared/components/sidebar/sidebar';

interface SellerReview {
  id: number;
  customer: {
    id: number;
    name: string;
    email: string;
    avatar: string;
  };
  product: {
    id: number;
    name: string;
    image: string;
    sku: string;
  };
  rating: number;
  title: string;
  content: string;
  images: string[];
  helpful: number;
  notHelpful: number;
  verified: boolean;
  date: Date;
  status: 'pending' | 'approved' | 'rejected';
  response?: string;
  respondedAt?: Date;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  verifiedReviews: number;
  responseRate: number;
  avgResponseTime: number;
}

@Component({
  selector: 'app-seller-reviews',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Sidebar],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css',
})
export class SellerReviews implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  searchTerm = '';
  selectedRating = '';
  selectedStatus = '';
  
  // Navigation items for sidebar
  navItems: NavItem[] = [
    { path: '/seller/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/seller/products', label: 'Products', icon: 'fas fa-box' },
    { path: '/seller/orders', label: 'Orders', icon: 'fas fa-shopping-cart' },
    { path: '/seller/analytics', label: 'Analytics', icon: 'fas fa-chart-line' },
    { path: '/seller/reviews', label: 'Reviews', icon: 'fas fa-star' },
    { path: '/seller/settings', label: 'Settings', icon: 'fas fa-cog' }
  ];
  selectedProduct = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  // Modal states
  showReviewModal = false;
  selectedReview: SellerReview | null = null;
  responding = false;
  
  // Forms
  responseForm: FormGroup;
  
  // Data
  reviews: SellerReview[] = [];
  filteredReviews: SellerReview[] = [];
  reviewStats: ReviewStats = {
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    pendingReviews: 0,
    approvedReviews: 0,
    rejectedReviews: 0,
    verifiedReviews: 0,
    responseRate: 0,
    avgResponseTime: 0
  };
  
  // Products for filter
  products: { id: number; name: string; sku: string }[] = [];
  
  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.responseForm = this.fb.group({
      response: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadReviews();
    this.loadProducts();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadReviews(): void {
    // TODO: Replace with actual API call
    this.http.get<SellerReview[]>('/api/seller/reviews').subscribe({
      next: (data) => {
        this.reviews = data;
        this.applyFilters();
        this.calculateStats();
      },
      error: (error) => {
        console.error('Failed to load reviews:', error);
        // Use mock data for now
        this.reviews = this.getMockReviews();
        this.applyFilters();
        this.calculateStats();
      }
    });
  }

  loadProducts(): void {
    // TODO: Replace with actual API call
    this.http.get<{ id: number; name: string; sku: string }[]>('/api/seller/products/names').subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (error) => {
        console.error('Failed to load products:', error);
        // Use mock data for now
        this.products = this.getMockProducts();
      }
    });
  }

  applyFilters(): void {
    let filtered = this.reviews;
    
    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(review => 
        review.customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        review.product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        review.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        review.content.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    // Filter by rating
    if (this.selectedRating) {
      filtered = filtered.filter(review => review.rating === parseInt(this.selectedRating));
    }
    
    // Filter by status
    if (this.selectedStatus) {
      filtered = filtered.filter(review => review.status === this.selectedStatus);
    }
    
    // Filter by product
    if (this.selectedProduct) {
      filtered = filtered.filter(review => review.product.id === parseInt(this.selectedProduct));
    }
    
    this.filteredReviews = filtered;
    this.totalPages = Math.ceil(this.filteredReviews.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  calculateStats(): void {
    const totalReviews = this.reviews.length;
    const averageRating = totalReviews > 0 
      ? this.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;
    
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    this.reviews.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });
    
    const pendingReviews = this.reviews.filter(r => r.status === 'pending').length;
    const approvedReviews = this.reviews.filter(r => r.status === 'approved').length;
    const rejectedReviews = this.reviews.filter(r => r.status === 'rejected').length;
    const verifiedReviews = this.reviews.filter(r => r.verified).length;
    
    const respondedReviews = this.reviews.filter(r => r.response).length;
    const responseRate = totalReviews > 0 ? (respondedReviews / totalReviews) * 100 : 0;
    
    // Calculate average response time (in hours)
    const responseTimes = this.reviews
      .filter(r => r.response && r.respondedAt)
      .map(r => (r.respondedAt!.getTime() - r.date.getTime()) / (1000 * 60 * 60));
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;
    
    this.reviewStats = {
      totalReviews,
      averageRating,
      ratingDistribution,
      pendingReviews,
      approvedReviews,
      rejectedReviews,
      verifiedReviews,
      responseRate,
      avgResponseTime
    };
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.applyFilters();
  }

  onRatingChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onProductChange(): void {
    this.applyFilters();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  viewReview(reviewId: number): void {
    const review = this.reviews.find(r => r.id === reviewId);
    if (review) {
      this.selectedReview = review;
      this.showReviewModal = true;
    }
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
    this.selectedReview = null;
    this.responseForm.reset();
  }

  approveReview(reviewId: number): void {
    this.http.patch(`/api/seller/reviews/${reviewId}`, { status: 'approved' }).subscribe({
      next: () => {
        const review = this.reviews.find(r => r.id === reviewId);
        if (review) {
          review.status = 'approved';
          this.applyFilters();
          this.calculateStats();
        }
      },
      error: (error) => {
        console.error('Failed to approve review:', error);
        alert('Failed to approve review. Please try again.');
      }
    });
  }

  rejectReview(reviewId: number): void {
    if (confirm('Are you sure you want to reject this review?')) {
      this.http.patch(`/api/seller/reviews/${reviewId}`, { status: 'rejected' }).subscribe({
        next: () => {
          const review = this.reviews.find(r => r.id === reviewId);
          if (review) {
            review.status = 'rejected';
            this.applyFilters();
            this.calculateStats();
          }
        },
        error: (error) => {
          console.error('Failed to reject review:', error);
          alert('Failed to reject review. Please try again.');
        }
      });
    }
  }

  respondToReview(): void {
    if (this.responseForm.valid && this.selectedReview) {
      this.responding = true;
      const response = this.responseForm.value.response;
      
      this.http.post(`/api/seller/reviews/${this.selectedReview.id}/respond`, { response }).subscribe({
        next: () => {
          if (this.selectedReview) {
            this.selectedReview.response = response;
            this.selectedReview.respondedAt = new Date();
            this.calculateStats();
          }
          this.responseForm.reset();
          this.responding = false;
        },
        error: (error) => {
          console.error('Failed to respond to review:', error);
          alert('Failed to respond to review. Please try again.');
          this.responding = false;
        }
      });
    }
  }

  markHelpful(reviewId: number): void {
    this.http.post(`/api/seller/reviews/${reviewId}/helpful`, {}).subscribe({
      next: () => {
        const review = this.reviews.find(r => r.id === reviewId);
        if (review) {
          review.helpful++;
        }
      },
      error: (error) => {
        console.error('Failed to mark review as helpful:', error);
      }
    });
  }

  markNotHelpful(reviewId: number): void {
    this.http.post(`/api/seller/reviews/${reviewId}/not-helpful`, {}).subscribe({
      next: () => {
        const review = this.reviews.find(r => r.id === reviewId);
        if (review) {
          review.notHelpful++;
        }
      },
      error: (error) => {
        console.error('Failed to mark review as not helpful:', error);
      }
    });
  }

  exportReviews(): void {
    // TODO: Implement review export functionality
    console.log('Export reviews functionality not implemented yet');
  }

  bulkApprove(): void {
    const pendingReviews = this.filteredReviews.filter(r => r.status === 'pending');
    if (pendingReviews.length === 0) {
      alert('No pending reviews to approve.');
      return;
    }
    
    if (confirm(`Are you sure you want to approve ${pendingReviews.length} reviews?`)) {
      Promise.all(
        pendingReviews.map(review => 
          this.http.patch(`/api/seller/reviews/${review.id}`, { status: 'approved' }).toPromise()
        )
      ).then(() => {
        pendingReviews.forEach(review => review.status = 'approved');
        this.applyFilters();
        this.calculateStats();
      }).catch((error) => {
        console.error('Failed to bulk approve reviews:', error);
        alert('Failed to approve some reviews. Please try again.');
      });
    }
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

  get paginatedReviews(): SellerReview[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredReviews.slice(start, end);
  }

  // Mock data methods
  getMockReviews(): SellerReview[] {
    return [
      {
        id: 1,
        customer: {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@example.com',
          avatar: 'https://picsum.photos/seed/customer1/200/200.jpg'
        },
        product: {
          id: 1,
          name: 'Wireless Headphones',
          image: 'https://picsum.photos/seed/headphones/100/100.jpg',
          sku: 'WBH-001'
        },
        rating: 5,
        title: 'Excellent sound quality!',
        content: 'These headphones exceeded my expectations. The noise cancellation is amazing and the battery life is incredible.',
        images: [
          'https://picsum.photos/seed/review1/300/300.jpg',
          'https://picsum.photos/seed/review2/300/300.jpg'
        ],
        helpful: 23,
        notHelpful: 2,
        verified: true,
        date: new Date('2024-01-20T10:30:00'),
        status: 'approved',
        response: 'Thank you for your wonderful review! We\'re glad you love the headphones.',
        respondedAt: new Date('2024-01-20T14:00:00')
      },
      {
        id: 2,
        customer: {
          id: 2,
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          avatar: 'https://picsum.photos/seed/customer2/200/200.jpg'
        },
        product: {
          id: 2,
          name: 'Smart Watch',
          image: 'https://picsum.photos/seed/watch/100/100.jpg',
          sku: 'SFW-002'
        },
        rating: 4,
        title: 'Great features, but battery could be better',
        content: 'The watch has amazing features and looks great. The only downside is that the battery doesn\'t last as long as advertised.',
        images: [],
        helpful: 15,
        notHelpful: 3,
        verified: true,
        date: new Date('2024-01-19T14:15:00'),
        status: 'pending'
      },
      {
        id: 3,
        customer: {
          id: 3,
          name: 'Bob Johnson',
          email: 'bob.johnson@example.com',
          avatar: 'https://picsum.photos/seed/customer3/200/200.jpg'
        },
        product: {
          id: 3,
          name: 'T-Shirt',
          image: 'https://picsum.photos/seed/tshirt/100/100.jpg',
          sku: 'OCT-003'
        },
        rating: 3,
        title: 'Good quality, but sizing is off',
        content: 'The material is nice and comfortable, but the sizing runs small. I had to order a size up.',
        images: [],
        helpful: 8,
        notHelpful: 4,
        verified: false,
        date: new Date('2024-01-18T16:45:00'),
        status: 'approved'
      },
      {
        id: 4,
        customer: {
          id: 4,
          name: 'Alice Brown',
          email: 'alice.brown@example.com',
          avatar: 'https://picsum.photos/seed/customer4/200/200.jpg'
        },
        product: {
          id: 4,
          name: 'Water Bottle',
          image: 'https://picsum.photos/seed/bottle/100/100.jpg',
          sku: 'SSB-004'
        },
        rating: 5,
        title: 'Perfect water bottle!',
        content: 'Keeps my water cold all day. The design is sleek and it\'s easy to clean.',
        images: [
          'https://picsum.photos/seed/review3/300/300.jpg'
        ],
        helpful: 12,
        notHelpful: 1,
        verified: true,
        date: new Date('2024-01-17T14:20:00'),
        status: 'approved'
      },
      {
        id: 5,
        customer: {
          id: 5,
          name: 'Charlie Davis',
          email: 'charlie.davis@example.com',
          avatar: 'https://picsum.photos/seed/customer5/200/200.jpg'
        },
        product: {
          id: 5,
          name: 'Phone Charger',
          image: 'https://picsum.photos/seed/charger/100/100.jpg',
          sku: 'WPC-005'
        },
        rating: 2,
        title: 'Stopped working after a month',
        content: 'The charger worked great for the first month, but then it suddenly stopped working. Disappointed.',
        images: [],
        helpful: 5,
        notHelpful: 8,
        verified: false,
        date: new Date('2024-01-16T12:30:00'),
        status: 'rejected'
      }
    ];
  }

  getMockProducts(): { id: number; name: string; sku: string }[] {
    return [
      { id: 1, name: 'Wireless Headphones', sku: 'WBH-001' },
      { id: 2, name: 'Smart Watch', sku: 'SFW-002' },
      { id: 3, name: 'T-Shirt', sku: 'OCT-003' },
      { id: 4, name: 'Water Bottle', sku: 'SSB-004' },
      { id: 5, name: 'Phone Charger', sku: 'WPC-005' }
    ];
  }

  // Helper methods
  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved': return 'approved';
      case 'pending': return 'pending';
      case 'rejected': return 'rejected';
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

  getRatingPercentage(rating: number): number {
    return this.reviewStats.totalReviews > 0 
      ? (this.reviewStats.ratingDistribution[rating as keyof typeof this.reviewStats.ratingDistribution] / this.reviewStats.totalReviews) * 100 
      : 0;
  }

  getRatingCount(rating: number): number {
    return this.reviewStats.ratingDistribution[rating as keyof typeof this.reviewStats.ratingDistribution] || 0;
  }

  createArray(length: number): any[] {
    return Array(length).fill(0);
  }

  formatPercentage(value: number): string {
    return `${Math.round(value)}%`;
  }

  closeModalOnOverlay(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeReviewModal();
    }
  }
}
