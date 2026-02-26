import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { NavItem } from '../../../shared/components/sidebar/sidebar';

interface SellerProduct {
  id: number;
  name: string;
  sku: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  stock: number;
  status: 'active' | 'inactive' | 'out-of-stock';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  sales: number;
  views: number;
  rating: number;
  reviews: number;
}

interface SellerCategory {
  id: string;
  name: string;
  productCount: number;
}

@Component({
  selector: 'app-seller-products',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Sidebar],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class SellerProducts implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  viewMode: 'grid' | 'list' = 'grid';
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';
  selectedSort = 'newest';
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;
  
  // Navigation items for sidebar
  navItems: NavItem[] = [
    { path: '/seller/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/seller/products', label: 'Products', icon: 'fas fa-box' },
    { path: '/seller/orders', label: 'Orders', icon: 'fas fa-shopping-cart' },
    { path: '/seller/analytics', label: 'Analytics', icon: 'fas fa-chart-line' },
    { path: '/seller/reviews', label: 'Reviews', icon: 'fas fa-star' },
    { path: '/seller/settings', label: 'Settings', icon: 'fas fa-cog' }
  ];
  
  // Modal states
  showProductModal = false;
  editingProduct: SellerProduct | null = null;
  saving = false;
  selectedProduct: SellerProduct | null = null;
  
  // Forms
  productForm: FormGroup;
  imagePreview: string | null = null;
  
  // Data
  products: SellerProduct[] = [];
  categories: SellerCategory[] = [];
  filteredProducts: SellerProduct[] = [];
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      sku: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      originalPrice: [''],
      category: ['', Validators.required],
      images: [[]],
      stock: [0, [Validators.required, Validators.min(0)]],
      status: ['active', Validators.required],
      tags: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadProducts(): void {
    // TODO: Replace with actual API call
    this.http.get<SellerProduct[]>('/api/seller/products').subscribe({
      next: (data) => {
        this.products = data;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Failed to load products:', error);
        // Use mock data for now
        this.products = this.getMockProducts();
        this.applyFilters();
      }
    });
  }

  loadCategories(): void {
    // TODO: Replace with actual API call
    this.http.get<SellerCategory[]>('/api/seller/categories').subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
        // Use mock data for now
        this.categories = this.getMockCategories();
      }
    });
  }

  applyFilters(): void {
    let filtered = this.products;
    
    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (this.selectedCategory) {
      filtered = filtered.filter(product => product.category === this.selectedCategory);
    }
    
    // Filter by status
    if (this.selectedStatus) {
      filtered = filtered.filter(product => product.status === this.selectedStatus);
    }
    
    // Sort products
    filtered = this.sortProducts(filtered);
    
    this.filteredProducts = filtered;
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  sortProducts(products: SellerProduct[]): SellerProduct[] {
    switch (this.selectedSort) {
      case 'newest':
        return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return products.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'price-low':
        return products.sort((a, b) => a.price - b.price);
      case 'price-high':
        return products.sort((a, b) => b.price - a.price);
      case 'name':
        return products.sort((a, b) => a.name.localeCompare(b.name));
      case 'sales':
        return products.sort((a, b) => b.sales - a.sales);
      case 'rating':
        return products.sort((a, b) => b.rating - a.rating);
      default:
        return products;
    }
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  openProductModal(product?: SellerProduct): void {
    this.editingProduct = product || null;
    if (product) {
      this.productForm.patchValue({
        name: product.name,
        sku: product.sku,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice || '',
        category: product.category,
        images: product.images,
        stock: product.stock,
        status: product.status,
        tags: product.tags.join(', ')
      });
      this.imagePreview = product.images[0] || null;
    } else {
      this.productForm.reset();
      this.imagePreview = null;
    }
    this.showProductModal = true;
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.editingProduct = null;
    this.productForm.reset();
    this.imagePreview = null;
  }

  closeModalOnOverlay(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay')) {
      this.closeProductModal();
    }
  }

  saveProduct(): void {
    if (this.productForm.valid) {
      this.saving = true;
      const productData = {
        ...this.productForm.value,
        images: this.productForm.value.images,
        tags: this.productForm.value.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
        updatedAt: new Date()
      };
      
      if (this.editingProduct) {
        // Update existing product
        this.http.put<SellerProduct>(`/api/seller/products/${this.editingProduct.id}`, productData).subscribe({
          next: (updatedProduct) => {
            const index = this.products.findIndex(p => p.id === this.editingProduct!.id);
            if (index !== -1) {
              this.products[index] = { ...updatedProduct, id: this.editingProduct!.id };
            }
            this.applyFilters();
            this.closeProductModal();
            this.saving = false;
          },
          error: (error) => {
            console.error('Failed to update product:', error);
            alert('Failed to update product. Please try again.');
            this.saving = false;
          }
        });
      } else {
        // Add new product
        const newProduct = {
          ...productData,
          id: Date.now(),
          createdAt: new Date(),
          sales: 0,
          views: 0,
          rating: 0,
          reviews: 0
        };
        
        this.http.post<SellerProduct>('/api/seller/products', newProduct).subscribe({
          next: (createdProduct) => {
            this.products.unshift(createdProduct);
            this.applyFilters();
            this.closeProductModal();
            this.saving = false;
          },
          error: (error) => {
            console.error('Failed to create product:', error);
            alert('Failed to create product. Please try again.');
            this.saving = false;
          }
        });
      }
    }
  }

  deleteProduct(productId: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      // TODO: Replace with actual API call
      this.http.delete(`/api/seller/products/${productId}`).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== productId);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Failed to delete product:', error);
          alert('Failed to delete product. Please try again.');
        }
      });
    }
  }

  viewProduct(productId: number): void {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.selectedProduct = product;
      this.openProductModal(product);
    }
  }

  editProduct(productId: number): void {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.openProductModal(product);
    }
  }

  duplicateProduct(productId: number): void {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      const duplicatedProduct = {
        ...product,
        id: Date.now(),
        name: `${product.name} (Copy)`,
        sku: `${product.sku}-COPY`,
        createdAt: new Date(),
        updatedAt: new Date(),
        sales: 0,
        views: 0,
        rating: 0,
        reviews: 0
      };
      
      this.http.post<SellerProduct>('/api/seller/products', duplicatedProduct).subscribe({
        next: (createdProduct) => {
          this.products.unshift(createdProduct);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Failed to duplicate product:', error);
          alert('Failed to duplicate product. Please try again.');
        }
      });
    }
  }

  toggleProductStatus(productId: number): void {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      
      this.http.patch(`/api/seller/products/${productId}`, { status: newStatus }).subscribe({
        next: () => {
          product.status = newStatus;
          product.updatedAt = new Date();
          this.applyFilters();
        },
        error: (error) => {
          console.error('Failed to update product status:', error);
          alert('Failed to update product status. Please try again.');
        }
      });
    }
  }

  onImageUpload(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
        const currentImages = this.productForm.get('images')?.value || [];
        this.productForm.patchValue({
          images: [...currentImages, this.imagePreview]
        });
      };
      
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number): void {
    const currentImages = this.productForm.get('images')?.value || [];
    const newImages = currentImages.filter((_: any, i: number) => i !== index);
    this.productForm.patchValue({
      images: newImages
    });
    
    if (index === 0 && newImages.length > 0) {
      this.imagePreview = newImages[0];
    } else if (newImages.length === 0) {
      this.imagePreview = null;
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

  get paginatedProducts(): SellerProduct[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProducts.slice(start, end);
  }

  exportProducts(): void {
    // TODO: Implement product export functionality
    console.log('Export products functionality not implemented yet');
  }

  bulkImport(): void {
    // TODO: Implement bulk import functionality
    console.log('Bulk import functionality not implemented yet');
  }

  // Mock data methods
  getMockProducts(): SellerProduct[] {
    return [
      {
        id: 1,
        name: 'Wireless Bluetooth Headphones',
        sku: 'WBH-001',
        description: 'Premium wireless headphones with noise cancellation and 30-hour battery life.',
        price: 199.99,
        originalPrice: 249.99,
        category: 'Electronics',
        images: [
          'https://picsum.photos/seed/headphones1/400/400.jpg',
          'https://picsum.photos/seed/headphones2/400/400.jpg',
          'https://picsum.photos/seed/headphones3/400/400.jpg'
        ],
        stock: 45,
        status: 'active',
        tags: ['wireless', 'bluetooth', 'noise-cancelling'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        sales: 234,
        views: 1456,
        rating: 4.5,
        reviews: 89
      },
      {
        id: 2,
        name: 'Smart Fitness Watch',
        sku: 'SFW-002',
        description: 'Advanced fitness tracking with heart rate monitor and GPS.',
        price: 299.99,
        category: 'Electronics',
        images: [
          'https://picsum.photos/seed/watch1/400/400.jpg',
          'https://picsum.photos/seed/watch2/400/400.jpg'
        ],
        stock: 12,
        status: 'active',
        tags: ['fitness', 'smartwatch', 'health'],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-18'),
        sales: 189,
        views: 987,
        rating: 4.2,
        reviews: 67
      },
      {
        id: 3,
        name: 'Organic Cotton T-Shirt',
        sku: 'OCT-003',
        description: 'Comfortable 100% organic cotton t-shirt in various colors.',
        price: 29.99,
        category: 'Clothing',
        images: [
          'https://picsum.photos/seed/tshirt1/400/400.jpg',
          'https://picsum.photos/seed/tshirt2/400/400.jpg'
        ],
        stock: 0,
        status: 'out-of-stock',
        tags: ['organic', 'cotton', 'eco-friendly'],
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-12'),
        sales: 156,
        views: 234,
        rating: 4.0,
        reviews: 34
      },
      {
        id: 4,
        name: 'Stainless Steel Water Bottle',
        sku: 'SSB-004',
        description: 'Double-walled insulated water bottle keeps drinks cold for 24 hours.',
        price: 24.99,
        category: 'Sports',
        images: [
          'https://picsum.photos/seed/bottle1/400/400.jpg',
          'https://picsum.photos/seed/bottle2/400/400.jpg'
        ],
        stock: 89,
        status: 'active',
        tags: ['stainless', 'insulated', 'eco-friendly'],
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-15'),
        sales: 145,
        views: 567,
        rating: 4.7,
        reviews: 45
      },
      {
        id: 5,
        name: 'Wireless Phone Charger',
        sku: 'WPC-005',
        description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
        price: 39.99,
        category: 'Electronics',
        images: [
          'https://picsum.photos/seed/charger1/400/400.jpg'
        ],
        stock: 3,
        status: 'active',
        tags: ['wireless', 'fast-charging', 'qi-enabled'],
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-20'),
        sales: 123,
        views: 890,
        rating: 4.3,
        reviews: 28
      }
    ];
  }

  getMockCategories(): SellerCategory[] {
    return [
      { id: 'electronics', name: 'Electronics', productCount: 3 },
      { id: 'clothing', name: 'Clothing', productCount: 1 },
      { id: 'sports', name: 'Sports', productCount: 1 }
    ];
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

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'active';
      case 'inactive': return 'inactive';
      case 'out-of-stock': return 'out-of-stock';
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
}
