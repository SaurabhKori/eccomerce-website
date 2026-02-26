import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { ProductCard } from '../../../shared/components/product-card/product-card';

// Import Math for template usage
declare var Math: any;

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  brand: string;
  featured?: boolean;
  discount?: number;
  topRated?: boolean;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  productCount?: number;
}

interface Offer {
  id: number;
  title: string;
  description: string;
  discount: number;
  image: string;
  validUntil: Date;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Navbar, Footer, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  cartItems = 3; // Mock cart items count
  loading = false;
  categories: Category[] = [];
  featuredProducts: Product[] = [];
  topRatedProducts: Product[] = [];
  offers: Offer[] = [];
  
  constructor(
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadHomeData();
  }

  loadHomeData(): void {
    // Mock data for demonstration
    this.categories = [
      { id: 1, name: 'Electronics', icon: 'fas fa-laptop', productCount: 245 },
      { id: 2, name: 'Clothing', icon: 'fas fa-tshirt', productCount: 189 },
      { id: 3, name: 'Home & Garden', icon: 'fas fa-home', productCount: 156 },
      { id: 4, name: 'Sports', icon: 'fas fa-football-ball', productCount: 98 }
    ];

    this.featuredProducts = [
      {
        id: 1,
        name: 'Wireless Headphones',
        price: 299.99,
        originalPrice: 399.99,
        image: 'https://via.placeholder.com/300x300?text=Headphones',
        rating: 4.5,
        reviews: 234,
        category: 'Electronics',
        brand: 'Sony',
        featured: true,
        discount: 25
      },
      {
        id: 2,
        name: 'Smart Watch',
        price: 199.99,
        originalPrice: 299.99,
        image: 'https://via.placeholder.com/300x300?text=Smart+Watch',
        rating: 4.2,
        reviews: 156,
        category: 'Electronics',
        brand: 'Apple',
        featured: true,
        discount: 33
      }
    ];

    this.topRatedProducts = [
      {
        id: 3,
        name: 'Laptop Pro',
        price: 999.99,
        originalPrice: 1299.99,
        image: 'https://via.placeholder.com/300x300?text=Laptop',
        rating: 4.8,
        reviews: 89,
        category: 'Electronics',
        brand: 'Dell',
        topRated: true,
        discount: 23
      },
      {
        id: 4,
        name: 'Camera Kit',
        price: 599.99,
        originalPrice: 799.99,
        image: 'https://via.placeholder.com/300x300?text=Camera',
        rating: 4.7,
        reviews: 67,
        category: 'Electronics',
        brand: 'Canon',
        topRated: true,
        discount: 25
      }
    ];

    this.offers = [
      {
        id: 1,
        title: 'Flash Sale - 50% Off',
        description: 'Limited time offer on selected electronics',
        discount: 50,
        image: 'https://via.placeholder.com/400x200?text=Flash+Sale',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        title: 'Weekend Special',
        description: 'Amazing deals on home appliances',
        discount: 30,
        image: 'https://via.placeholder.com/400x200?text=Weekend+Deal',
        validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  createArray(length: number): any[] {
    return Array(length).fill(0);
  }

  getRatingStars(rating: number): any[] {
    return this.createArray(Math.floor(rating || 0));
  }

  getDiscountPercentage(originalPrice: number, currentPrice: number): number {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  formatCurrency(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  formatPercentage(value: number): string {
    return value + '%';
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  viewCategory(categoryId: number | string): void {
    if (categoryId === 'all' || categoryId === 0) {
      this.router.navigate(['/products']);
    } else {
      this.router.navigate(['/products'], { queryParams: { category: categoryId } });
    }
  }

  addToCart(product: Product): void {
    // Mock add to cart functionality
    this.cartItems++;
    alert(`${product.name} added to cart!`);
  }

  addToWishlist(product: Product): void {
    // Mock add to wishlist functionality
    alert(`${product.name} added to wishlist!`);
  }
}
