import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AdminSidebar } from '../../../shared/admin-sidebar/admin-sidebar';

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  status: 'active' | 'inactive' | 'out-of-stock';
  image: string;
  description?: string;
  createdAt: Date;
}

interface Category {
  id: string;
  name: string;
}

@Component({
  selector: 'app-products',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AdminSidebar],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  viewMode: 'grid' | 'list' = 'grid';
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;
  
  // Modal states
  showProductModal = false;
  editingProduct: Product | null = null;
  saving = false;
  
  // Forms
  productForm: FormGroup;
  
  // Data
  products: Product[] = [];
  categories: Category[] = [
    { id: 'electronics', name: 'Electronics' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'home', name: 'Home & Garden' },
    { id: 'sports', name: 'Sports' },
    { id: 'books', name: 'Books' },
    { id: 'toys', name: 'Toys & Games' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      sku: ['', Validators.required],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      status: ['active', Validators.required],
      description: [''],
      image: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {}

  get filteredProducts(): Product[] {
    let filtered = this.products;
    
    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(this.searchTerm.toLowerCase())
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
    
    // Pagination
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    return filtered.slice(startIndex, endIndex);
  }

  loadProducts(): void {
    // TODO: Replace with actual API call
    this.http.get<Product[]>('/api/admin/products').subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (error) => {
        console.error('Failed to load products:', error);
        // Load mock data for demo
        this.products = this.getMockProducts();
      }
    });
  }

  getMockProducts(): Product[] {
    return [
      {
        id: 1,
        name: 'Wireless Headphones',
        sku: 'WH-001',
        category: 'Electronics',
        price: 89.99,
        originalPrice: 129.99,
        stock: 45,
        status: 'active',
        image: 'https://picsum.photos/seed/headphones/200/200.jpg',
        description: 'High-quality wireless headphones with noise cancellation',
        createdAt: new Date('2024-01-10')
      },
      {
        id: 2,
        name: 'Smart Watch',
        sku: 'SW-002',
        category: 'Electronics',
        price: 199.99,
        stock: 12,
        status: 'active',
        image: 'https://picsum.photos/seed/watch/200/200.jpg',
        description: 'Feature-rich smartwatch with health tracking',
        createdAt: new Date('2024-01-12')
      },
      {
        id: 3,
        name: 'Running Shoes',
        sku: 'RS-003',
        category: 'Sports',
        price: 79.99,
        stock: 0,
        status: 'out-of-stock',
        image: 'https://picsum.photos/seed/shoes/200/200.jpg',
        description: 'Professional running shoes for athletes',
        createdAt: new Date('2024-01-08')
      },
      {
        id: 4,
        name: 'Coffee Maker',
        sku: 'CM-004',
        category: 'Home & Garden',
        price: 149.99,
        stock: 8,
        status: 'inactive',
        image: 'https://picsum.photos/seed/coffee/200/200.jpg',
        description: 'Automatic coffee maker with timer',
        createdAt: new Date('2024-01-05')
      },
      {
        id: 5,
        name: 'Yoga Mat',
        sku: 'YM-005',
        category: 'Sports',
        price: 29.99,
        stock: 67,
        status: 'active',
        image: 'https://picsum.photos/seed/yoga/200/200.jpg',
        description: 'Non-slip yoga mat with carrying strap',
        createdAt: new Date('2024-01-15')
      },
      {
        id: 6,
        name: 'Bluetooth Speaker',
        sku: 'BS-006',
        category: 'Electronics',
        price: 49.99,
        stock: 23,
        status: 'active',
        image: 'https://picsum.photos/seed/speaker/200/200.jpg',
        description: 'Portable bluetooth speaker with excellent sound',
        createdAt: new Date('2024-01-11')
      }
    ];
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.currentPage = 1;
  }

  onCategoryChange(): void {
    this.currentPage = 1;
  }

  onStatusChange(): void {
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'in-stock';
  }

  openAddProductModal(): void {
    this.editingProduct = null;
    this.productForm.reset({
      name: '',
      sku: '',
      category: '',
      price: '',
      stock: '',
      status: 'active',
      description: '',
      image: ''
    });
    this.showProductModal = true;
  }

  editProduct(productId: number): void {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.editingProduct = product;
      this.productForm.patchValue({
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price,
        stock: product.stock,
        status: product.status,
        description: product.description || '',
        image: product.image
      });
      this.showProductModal = true;
    }
  }

  deleteProduct(productId: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      // TODO: Replace with actual API call
      this.http.delete(`/api/admin/products/${productId}`).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== productId);
        },
        error: (error) => {
          console.error('Failed to delete product:', error);
          alert('Failed to delete product. Please try again.');
        }
      });
    }
  }

  saveProduct(): void {
    if (this.productForm.valid) {
      this.saving = true;
      const productData = this.productForm.value;
      
      if (this.editingProduct) {
        // Update existing product
        this.http.put<Product>(`/api/admin/products/${this.editingProduct.id}`, productData).subscribe({
          next: (updatedProduct: Product) => {
            const index = this.products.findIndex(p => p.id === this.editingProduct!.id);
            if (index !== -1) {
              this.products[index] = { ...updatedProduct, id: this.editingProduct!.id };
            }
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
        this.http.post<Product>('/api/admin/products', productData).subscribe({
          next: (newProduct: Product) => {
            this.products.unshift(newProduct);
            this.closeProductModal();
            this.saving = false;
          },
          error: (error) => {
            console.error('Failed to add product:', error);
            alert('Failed to add product. Please try again.');
            this.saving = false;
          }
        });
      }
    }
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.editingProduct = null;
    this.productForm.reset();
  }

  closeModalOnOverlay(event: Event): void {
    const target = event.target as Element;
    if (target.classList.contains('modal-overlay')) {
      this.closeProductModal();
    }
  }
}
