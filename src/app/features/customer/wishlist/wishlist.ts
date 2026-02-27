import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';

// Import Math for template usage
declare var Math: any;

interface WishlistItem {
  id: number;
  productId: number;
  product: {
    id: number;
    name: string;
    image: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviews: number;
    stock: number;
  };
  addedAt: Date;
}

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule, Navbar,Footer],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css'
})
export class Wishlist implements OnInit {
  sidebarCollapsed = false;
  wishlistItems: WishlistItem[] = [];
  loading = false;
  
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
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // this.loadWishlist();
     this.wishlistItems = this.generateMockWishlistItems();
  }

  loadWishlist(): void {
    this.loading = true;
    this.http.get<WishlistItem[]>('/api/wishlist').subscribe({
      next: (items) => {
        this.wishlistItems = items;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading wishlist:', error);
        this.loading = false;
       
      }
    });
  }

  removeFromWishlist(itemId: number): void {
    this.http.delete(`/api/wishlist/${itemId}`).subscribe({
      next: () => {
        this.wishlistItems = this.wishlistItems.filter(item => item.id !== itemId);
      },
      error: (error) => {
        console.error('Error removing from wishlist:', error);
      }
    });
  }

  addToCart(productId: number): void {
    this.http.post('/api/cart/add', { productId, quantity: 1 }).subscribe({
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

  moveToCart(item: WishlistItem): void {
    this.addToCart(item.productId);
    this.removeFromWishlist(item.id);
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
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

  getWishlistTotal(): number {
    return this.wishlistItems.reduce((sum, item) => sum + item.product.price, 0);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  addAllToCart(): void {
    const productIds = this.wishlistItems.map(item => item.productId);
    
    this.http.post('/api/cart/add-multiple', { productIds }).subscribe({
      next: () => {
        alert(`${productIds.length} items added to cart!`);
        this.router.navigate(['/cart']);
      },
      error: (error) => {
        console.error('Error adding items to cart:', error);
        alert('Failed to add items to cart. Please try again.');
      }
    });
  }

  clearWishlist(): void {
    if (confirm('Are you sure you want to clear your wishlist?')) {
      this.http.delete('/api/wishlist/clear').subscribe({
        next: () => {
          this.wishlistItems = [];
        },
        error: (error) => {
          console.error('Error clearing wishlist:', error);
        }
      });
    }
  }

  private generateMockWishlistItems(): WishlistItem[] {
    return [
      {
        id: 1,
        productId: 101,
        product: {
          id: 101,
          name: 'Premium Wireless Headphones',
          image: 'https://via.placeholder.com/200x200?text=Headphones',
          price: 199.99,
          originalPrice: 299.99,
          rating: 4.5,
          reviews: 234,
          stock: 15
        },
        addedAt: new Date('2024-01-15')
      },
      {
        id: 2,
        productId: 102,
        product: {
          id: 102,
          name: 'Smart Fitness Watch',
          image: 'https://via.placeholder.com/200x200?text=Smart+Watch',
          price: 149.99,
          rating: 4.3,
          reviews: 156,
          stock: 8
        },
        addedAt: new Date('2024-01-10')
      },
      {
        id: 3,
        productId: 103,
        product: {
          id: 103,
          name: 'Laptop Backpack',
          image: 'https://via.placeholder.com/200x200?text=Backpack',
          price: 79.99,
          originalPrice: 99.99,
          rating: 4.7,
          reviews: 89,
          stock: 25
        },
        addedAt: new Date('2024-01-05')
      }
    ];
  }
   routes(route:any) {
    this.router.navigate([`${route}`]);
  }
}
