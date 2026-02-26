import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { NavItem } from '../../../shared/components/sidebar/sidebar';

// Import Math for template usage
declare var Math: any;

interface Review {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
}

interface ProductReview {
  id: number;
  name: string;
  image: string;
  averageRating: number;
  totalReviews: number;
  userReview?: Review;
}

@Component({
  selector: 'app-reviews',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Sidebar],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css'
})
export class Reviews implements OnInit {
  sidebarCollapsed = false;
  productId: string | null = null;
  reviews: Review[] = [];
  product: ProductReview | null = null;
  loading = false;
  submittingReview = false;
  
  // Forms
  reviewForm: FormGroup;
  filterForm: FormGroup;
  
  // UI State
  showReviewForm = false;
  selectedRating = 0;
  sortBy = 'recent';
  filterRating = '';
  
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
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      title: ['', Validators.required],
      comment: ['', [Validators.required, Validators.minLength(10)]],
      recommend: [true]
    });

    this.filterForm = this.fb.group({
      sortBy: ['recent'],
      rating: ['']
    });
  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.loadProductReviews(parseInt(this.productId));
    } else {
      this.loadAllReviews();
    }
    
    // Listen to filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadProductReviews(productId: number): void {
    this.loading = true;
    this.http.get<any>(`/api/products/${productId}/reviews`).subscribe({
      next: (data) => {
        this.product = data.product;
        this.reviews = data.reviews;
        this.loading = false;
        
        // Check if user has already reviewed
        const userReview = this.reviews.find(review => review.verified);
        if (userReview && this.product) {
          this.product.userReview = userReview;
        }
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.loading = false;
        const mockData = this.generateMockProductReviews(productId);
        this.product = mockData.product;
        this.reviews = mockData.reviews;
      }
    });
  }

  loadAllReviews(): void {
    this.loading = true;
    this.http.get<Review[]>('/api/reviews/user').subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.loading = false;
        this.reviews = this.generateMockUserReviews();
      }
    });
  }

  submitReview(): void {
    if (this.reviewForm.invalid || this.submittingReview) return;

    this.submittingReview = true;
    
    const reviewData = {
      productId: this.productId ? parseInt(this.productId) : null,
      ...this.reviewForm.value
    };

    this.http.post('/api/reviews', reviewData).subscribe({
      next: (response: any) => {
        this.submittingReview = false;
        this.reviews.unshift(response.review);
        this.showReviewForm = false;
        this.reviewForm.reset({ rating: 0, recommend: true });
        this.selectedRating = 0;
        
        if (this.product) {
          this.product.userReview = response.review;
          this.product.totalReviews++;
        }
        
        alert('Review submitted successfully!');
      },
      error: (error) => {
        console.error('Error submitting review:', error);
        this.submittingReview = false;
        alert('Failed to submit review. Please try again.');
      }
    });
  }

  editReview(review: Review): void {
    this.reviewForm.patchValue({
      rating: review.rating,
      title: review.title,
      comment: review.comment
    });
    this.selectedRating = review.rating;
    this.showReviewForm = true;
  }

  deleteReview(reviewId: number): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.http.delete(`/api/reviews/${reviewId}`).subscribe({
        next: () => {
          this.reviews = this.reviews.filter(r => r.id !== reviewId);
          if (this.product?.userReview?.id === reviewId) {
            delete this.product.userReview;
            this.product.totalReviews--;
          }
          alert('Review deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting review:', error);
          alert('Failed to delete review. Please try again.');
        }
      });
    }
  }

  markHelpful(reviewId: number): void {
    this.http.post(`/api/reviews/${reviewId}/helpful`, {}).subscribe({
      next: () => {
        const review = this.reviews.find(r => r.id === reviewId);
        if (review) {
          review.helpful++;
        }
      },
      error: (error) => {
        console.error('Error marking helpful:', error);
      }
    });
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
    this.reviewForm.patchValue({ rating });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    
    let filteredReviews = [...this.reviews];
    
    // Filter by rating
    if (filters.rating) {
      filteredReviews = filteredReviews.filter(review => review.rating === parseInt(filters.rating));
    }
    
    // Sort reviews
    switch (filters.sortBy) {
      case 'recent':
        filteredReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'helpful':
        filteredReviews.sort((a, b) => b.helpful - a.helpful);
        break;
      case 'rating-high':
        filteredReviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-low':
        filteredReviews.sort((a, b) => a.rating - b.rating);
        break;
    }
    
    this.reviews = filteredReviews;
  }

  createArray(length: number): any[] {
    return Array(length).fill(0);
  }

  getRatingStars(rating: number): any[] {
    return this.createArray(Math.floor(rating || 0));
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

  private generateMockProductReviews(productId: number): { product: ProductReview; reviews: Review[] } {
    const product: ProductReview = {
      id: productId,
      name: `Premium Product ${productId}`,
      image: `https://via.placeholder.com/100x100?text=Product+${productId}`,
      averageRating: 4.2,
      totalReviews: 156
    };

    const reviews: Review[] = [
      {
        id: 1,
        productId,
        productName: product.name,
        productImage: product.image,
        rating: 5,
        title: 'Excellent Product!',
        comment: 'This is exactly what I was looking for. Great quality and fast delivery.',
        date: '2024-01-15',
        verified: true,
        helpful: 23
      },
      {
        id: 2,
        productId,
        productName: product.name,
        productImage: product.image,
        rating: 4,
        title: 'Good Value',
        comment: 'Product is good quality for the price. Minor issues with packaging but overall satisfied.',
        date: '2024-01-10',
        verified: true,
        helpful: 15
      },
      {
        id: 3,
        productId,
        productName: product.name,
        productImage: product.image,
        rating: 3,
        title: 'Average Experience',
        comment: 'Product works as expected but nothing exceptional. Customer service was helpful though.',
        date: '2024-01-05',
        verified: false,
        helpful: 8
      }
    ];

    return { product, reviews };
  }

  private generateMockUserReviews(): Review[] {
    return [
      {
        id: 1,
        productId: 101,
        productName: 'Wireless Headphones',
        productImage: 'https://via.placeholder.com/100x100',
        rating: 5,
        title: 'Amazing Sound Quality',
        comment: 'Best headphones I have ever owned. Noise cancellation is excellent.',
        date: '2024-01-20',
        verified: true,
        helpful: 45
      },
      {
        id: 2,
        productId: 102,
        productName: 'Smart Watch',
        productImage: 'https://via.placeholder.com/100x100',
        rating: 4,
        title: 'Great Features',
        comment: 'Love the fitness tracking and battery life. Could be more comfortable.',
        date: '2024-01-15',
        verified: true,
        helpful: 32
      }
    ];
  }

    routes(route:any) {
    this.router.navigate([`${route}`]);
  }
}
