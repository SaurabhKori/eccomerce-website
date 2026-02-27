import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { ProductCard } from '../../../shared/components/product-card/product-card';
// import { SwiperModule } from 'swiper/angular';
// import SwiperCore, { Autoplay, Pagination } from 'swiper';
import { SkeletonLoader } from '../../../shared/skeleton-loader/skeleton-loader';

// SwiperCore.use([Autoplay, Pagination]);

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
  wishlisted?: boolean;
  stars?: number[];
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
  imports: [
    CommonModule,
    Navbar,
    Footer,
    ProductCard,
    SkeletonLoader
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class Home implements OnInit {

  loading:boolean = false;

  banners = [
    { image: '/banner/banner4.jpg' },
    { image: '/banner/banner2.jpg' },
    { image: '/banner/banner3.jpg' }
  ];

  categories: Category[] = [];
  featuredProducts: Product[] = [];
  offers: Offer[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadHomeData();
  }

  loadHomeData(): void {

    this.categories = [
      { id: 1, name: 'Electronics', icon: 'fas fa-laptop', productCount: 245 },
      { id: 2, name: 'Clothing', icon: 'fa-solid fa-shirt', productCount: 189 },
      { id: 3, name: 'Home & Garden', icon: 'fas fa-home', productCount: 156 },
      { id: 4, name: 'Sports', icon: 'fas fa-football-ball', productCount: 98 }
    ];

    const products: Product[] = [
      {
        id: 1,
        name: 'Wireless Headphones',
        price: 299.99,
        originalPrice: 399.99,
        image: '/product/download.jpg',
        rating: 4.5,
        reviews: 234,
        category: 'Electronics',
        brand: 'Sony',
        discount: 25
      },
      {
        id: 2,
        name: 'Smart Watch',
        price: 199.99,
        originalPrice: 299.99,
        image: '/product/watch.jpg',
        rating: 4.2,
        reviews: 156,
        category: 'Electronics',
        brand: 'Apple',
        discount: 33
      }
    ];

    // 🔥 Precompute stars safely (NO invalid array error)
    this.featuredProducts = products.map(p => ({
      ...p,
      wishlisted: false,
      stars: this.buildStars(p.rating)
    }));

    this.offers = [
      {
        id: 1,
        title: 'Flash Sale - 50% Off',
        description: 'Limited time offer on selected electronics',
        discount: 50,
        image: '/product/offer1.jpg',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        title: 'Weekend Special',
        description: 'Amazing deals on home appliances',
        discount: 30,
         image: '/product/offer1.jpg',
        validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      }
    ];

    // Simulate loading delay for skeleton
    setTimeout(() => {
      this.loading = false;
    }, 1200);
  }

  // ⭐ Safe rating builder
  buildStars(rating: any): number[] {
    const value = Number(rating);
    if (!Number.isFinite(value) || value <= 0) return [];
    return Array(Math.floor(value)).fill(0);
  }

  viewCategory(categoryId: number): void {
    this.router.navigate(['/products'], {
      queryParams: { category: categoryId }
    });
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  addToCart(product: Product): void {
    alert(`${product.name} added to cart!`);
  }

  toggleWishlist(product: Product): void {
    product.wishlisted = !product.wishlisted;
  }
}