import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';

// Import Math for template usage
declare var Math: any;

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviews: number;
  category: string;
  brand: string;
  discount?: number;
  stock: number;
  description: string;
  variants: {
    size?: string[];
    color?: string[];
  };
}

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Sidebar, Navbar, Footer],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {
  sidebarCollapsed = false;
  product: Product | null = null;
  loading = false;
  selectedImageIndex = 0;
  selectedSize = '';
  selectedColor = '';
  quantity = 1;
  reviews: Review[] = [];
  
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
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(parseInt(productId));
      this.loadReviews(parseInt(productId));
    }
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.http.get<Product>(`/api/products/${id}`).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
        // Set default selections
        if (product.variants.size?.length) {
          this.selectedSize = product.variants.size[0];
        }
        if (product.variants.color?.length) {
          this.selectedColor = product.variants.color[0];
        }
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.loading = false;
        this.product = this.generateMockProduct(id);
      }
    });
  }

  loadReviews(productId: number): void {
    this.http.get<Review[]>(`/api/products/${productId}/reviews`).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.reviews = this.generateMockReviews();
      }
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  selectSize(size: string): void {
    this.selectedSize = size;
  }

  selectColor(color: string): void {
    this.selectedColor = color;
  }

  updateQuantity(action: 'increase' | 'decrease'): void {
    if (action === 'increase') {
      this.quantity++;
    } else if (action === 'decrease' && this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.product) return;
    
    const cartItem = {
      productId: this.product.id,
      quantity: this.quantity,
      size: this.selectedSize,
      color: this.selectedColor
    };

    this.http.post('/api/cart/add', cartItem).subscribe({
      next: () => {
        alert('Product added to cart!');
        this.router.navigate(['/cart']);
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        alert('Failed to add to cart. Please try again.');
      }
    });
  }

  buyNow(): void {
    this.addToCart();
    this.router.navigate(['/checkout']);
  }

  addToWishlist(): void {
    if (!this.product) return;
    
    this.http.post(`/api/wishlist/add`, { productId: this.product.id }).subscribe({
      next: () => {
        alert('Product added to wishlist!');
      },
      error: (error) => {
        console.error('Error adding to wishlist:', error);
        alert('Failed to add to wishlist. Please try again.');
      }
    });
  }

  formatCurrency(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  getDiscountPercentage(originalPrice: number, currentPrice: number): number {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  createArray(length: number): any[] {
    return Array(length).fill(0);
  }

  getRatingStars(rating: number): any[] {
    return this.createArray(Math.floor(rating || 0));
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  private generateMockProduct(id: number): Product {
    return {
      id,
      name: `Premium Product ${id}`,
      price: 299.99,
      originalPrice: 399.99,
      images: [
        `https://via.placeholder.com/600x600?text=Product+${id}+Image+1`,
        `https://via.placeholder.com/600x600?text=Product+${id}+Image+2`,
        `https://via.placeholder.com/600x600?text=Product+${id}+Image+3`,
        `https://via.placeholder.com/600x600?text=Product+${id}+Image+4`
      ],
      rating: 4.5,
      reviews: 128,
      category: 'Electronics',
      brand: 'TechBrand',
      stock: 15,
      description: 'This is a premium quality product with amazing features and durability. Made with high-quality materials and designed to provide the best user experience.',
      variants: {
        size: ['S', 'M', 'L', 'XL'],
        color: ['Black', 'White', 'Blue', 'Red']
      }
    };
  }

  private generateMockReviews(): Review[] {
    return [
      {
        id: 1,
        userName: 'John Doe',
        rating: 5,
        comment: 'Excellent product! Exactly what I was looking for.',
        date: '2024-01-15',
        verified: true
      },
      {
        id: 2,
        userName: 'Jane Smith',
        rating: 4,
        comment: 'Good quality product, but shipping took a bit longer than expected.',
        date: '2024-01-10',
        verified: true
      },
      {
        id: 3,
        userName: 'Mike Johnson',
        rating: 5,
        comment: 'Amazing product! Highly recommend to everyone.',
        date: '2024-01-05',
        verified: false
      }
    ];
  }
}
