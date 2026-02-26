import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';

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
  discount?: number;
  stock: number;
}

interface FilterOptions {
  categories: string[];
  brands: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Navbar, Footer],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = false;
  
  // Filters
  filterForm: FormGroup;
  filterOptions: FilterOptions = {
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 10000 }
  };
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;
  
  // Sorting
  sortBy = 'popularity';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      category: [''],
      brand: [''],
      minPrice: [''],
      maxPrice: [''],
      rating: [''],
      search: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadFilterOptions();
    
    // Listen to query params
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.filterForm.patchValue({ category: params['category'] });
      }
      if (params['sort']) {
        this.sortBy = params['sort'];
      }
      this.applyFilters();
    });
    
    // Listen to form changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadProducts(): void {
    this.loading = false;
    this.http.get<Product[]>('/api/products').subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.updatePagination();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
        // Fallback data
        this.products = this.generateMockProducts();
        this.filteredProducts = this.products;
        this.updatePagination();
      }
    });
  }

  loadFilterOptions(): void {
    this.http.get<FilterOptions>('/api/products/filters').subscribe({
      next: (options) => {
        this.filterOptions = options;
      },
      error: (error) => {
        console.error('Error loading filter options:', error);
        // Fallback data
        this.filterOptions = {
          categories: ['Electronics', 'Clothing', 'Home & Living', 'Beauty', 'Sports'],
          brands: ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG'],
          priceRange: { min: 0, max: 10000 }
        };
      }
    });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    
    this.filteredProducts = this.products.filter(product => {
      // Category filter
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      
      // Brand filter
      if (filters.brand && product.brand !== filters.brand) {
        return false;
      }
      
      // Price filter
      if (filters.minPrice && product.price < parseFloat(filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice && product.price > parseFloat(filters.maxPrice)) {
        return false;
      }
      
      // Rating filter
      if (filters.rating && product.rating < parseFloat(filters.rating)) {
        return false;
      }
      
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (!product.name.toLowerCase().includes(searchTerm) &&
            !product.brand.toLowerCase().includes(searchTerm) &&
            !product.category.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }
      
      return true;
    });
    
    this.applySorting();
    this.updatePagination();
  }

  applySorting(): void {
    switch (this.sortBy) {
      case 'price-low':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        this.filteredProducts.sort((a, b) => b.id - a.id);
        break;
      case 'rating':
        this.filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
      default:
        this.filteredProducts.sort((a, b) => b.reviews - a.reviews);
        break;
    }
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  get paginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProducts.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    const start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible - 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  addToCart(product: Product): void {
    // TODO: Implement add to cart logic
    console.log('Adding to cart:', product.name);
  }

  addToWishlist(product: Product): void {
    // TODO: Implement add to wishlist logic
    console.log('Adding to wishlist:', product.name);
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

  // createArray(length: number): any[] {
  //   return Array(length).fill(0);
  // }
  createArray(length: any): number[] {

  const safeLength = Number(length);

  if (!safeLength || safeLength < 0) {
    return [];
  }

  return Array(Math.floor(safeLength)).fill(0);
}

  clearFilters(): void {
    this.filterForm.reset();
    this.applyFilters();
  }

  private generateMockProducts(): Product[] {
    const mockProducts: Product[] = [];
    const categories = ['Electronics', 'Clothing', 'Home & Living', 'Beauty', 'Sports'];
    const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG'];
    
    for (let i = 1; i <= 50; i++) {
      mockProducts.push({
        id: i,
        name: `Product ${i}`,
        price: Math.floor(Math.random() * 1000) + 50,
        originalPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 1200) + 100 : undefined,
        image: `https://via.placeholder.com/300x300?text=Product+${i}`,
        rating: Math.floor(Math.random() * 2) + 3,
        reviews: Math.floor(Math.random() * 500) + 10,
        category: categories[Math.floor(Math.random() * categories.length)],
        brand: brands[Math.floor(Math.random() * brands.length)],
        stock: Math.floor(Math.random() * 100) + 1
      });
    }
    
    return mockProducts;
  }
}
