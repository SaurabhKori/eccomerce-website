import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AdminSidebar } from '../../../shared/admin-sidebar/admin-sidebar';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  parentCategory?: string;
}

@Component({
  selector: 'app-categories',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AdminSidebar],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  viewMode: 'grid' | 'list' = 'grid';
  searchTerm = '';
  selectedStatus = '';
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;
  
  // Modal states
  showCategoryModal = false;
  editingCategory: Category | null = null;
  saving = false;
  selectedCategory: Category | null = null;
  
  // Forms
  categoryForm: FormGroup;
  
  // Data
  categories: Category[] = [
    {
      id: 'electronics',
      name: 'Electronics',
      description: 'Electronic devices, gadgets, and accessories',
      image: 'https://picsum.photos/seed/electronics/400/300.jpg',
      productCount: 156,
      status: 'active',
      createdAt: new Date('2023-01-15')
    },
    {
      id: 'clothing',
      name: 'Clothing',
      description: 'Fashion apparel, shoes, and accessories',
      image: 'https://picsum.photos/seed/clothing/400/300.jpg',
      productCount: 234,
      status: 'active',
      createdAt: new Date('2023-01-20')
    },
    {
      id: 'home-garden',
      name: 'Home & Garden',
      description: 'Furniture, decor, and outdoor items',
      image: 'https://picsum.photos/seed/home/400/300.jpg',
      productCount: 89,
      status: 'active',
      createdAt: new Date('2023-02-10')
    },
    {
      id: 'sports',
      name: 'Sports & Outdoors',
      description: 'Sports equipment and outdoor gear',
      image: 'https://picsum.photos/seed/sports/400/300.jpg',
      productCount: 67,
      status: 'active',
      createdAt: new Date('2023-02-15')
    },
    {
      id: 'books',
      name: 'Books & Media',
      description: 'Books, movies, music, and games',
      image: 'https://picsum.photos/seed/books/400/300.jpg',
      productCount: 145,
      status: 'active',
      createdAt: new Date('2023-03-01')
    },
    {
      id: 'toys',
      name: 'Toys & Games',
      description: 'Children toys, games, and educational items',
      image: 'https://picsum.photos/seed/toys/400/300.jpg',
      productCount: 78,
      status: 'inactive',
      createdAt: new Date('2023-03-10')
    },
    {
      id: 'beauty',
      name: 'Beauty & Personal Care',
      description: 'Cosmetics, skincare, and personal care products',
      image: 'https://picsum.photos/seed/beauty/400/300.jpg',
      productCount: 92,
      status: 'active',
      createdAt: new Date('2023-03-15')
    },
    {
      id: 'automotive',
      name: 'Automotive',
      description: 'Car parts, accessories, and tools',
      image: 'https://picsum.photos/seed/automotive/400/300.jpg',
      productCount: 43,
      status: 'active',
      createdAt: new Date('2023-04-01')
    }
  ];
  
  filteredCategories: Category[] = [];
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      image: ['', Validators.required],
      status: ['active', Validators.required],
      parentCategory: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadCategories(): void {
    // TODO: Replace with actual API call
    this.http.get<Category[]>('/api/admin/categories').subscribe({
      next: (data) => {
        this.categories = data;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
        // Use mock data for now
        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    this.filteredCategories = this.categories.filter(category => {
      const matchesSearch = !this.searchTerm || 
        category.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || category.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
    
    this.totalPages = Math.ceil(this.filteredCategories.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  openCategoryModal(category?: Category): void {
    this.editingCategory = category || null;
    if (category) {
      this.categoryForm.patchValue({
        name: category.name,
        description: category.description,
        image: category.image,
        status: category.status,
        parentCategory: category.parentCategory || ''
      });
    } else {
      this.categoryForm.reset();
    }
    this.showCategoryModal = true;
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
    this.editingCategory = null;
    this.categoryForm.reset();
  }

  saveCategory(): void {
    if (this.categoryForm.valid) {
      this.saving = true;
      const categoryData = this.categoryForm.value;
      
      if (this.editingCategory) {
        // Update existing category
        this.http.put<Category>(`/api/admin/categories/${this.editingCategory.id}`, categoryData).subscribe({
          next: (updatedCategory) => {
            const index = this.categories.findIndex(c => c.id === this.editingCategory!.id);
            if (index !== -1) {
              this.categories[index] = { ...updatedCategory, id: this.editingCategory!.id };
            }
            this.applyFilters();
            this.closeCategoryModal();
            this.saving = false;
          },
          error: (error) => {
            console.error('Failed to update category:', error);
            alert('Failed to update category. Please try again.');
            this.saving = false;
          }
        });
      } else {
        // Add new category
        this.http.post<Category>('/api/admin/categories', categoryData).subscribe({
          next: (newCategory) => {
            this.categories.unshift(newCategory);
            this.applyFilters();
            this.closeCategoryModal();
            this.saving = false;
          },
          error: (error) => {
            console.error('Failed to create category:', error);
            alert('Failed to create category. Please try again.');
            this.saving = false;
          }
        });
      }
    }
  }

  deleteCategory(categoryId: string): void {
    if (confirm('Are you sure you want to delete this category?')) {
      // TODO: Replace with actual API call
      this.http.delete(`/api/admin/categories/${categoryId}`).subscribe({
        next: () => {
          this.categories = this.categories.filter(c => c.id !== categoryId);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Failed to delete category:', error);
          alert('Failed to delete category. Please try again.');
        }
      });
    }
  }

  viewCategory(categoryId: string): void {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      this.selectedCategory = category;
      this.showCategoryModal = true;
    }
  }

  editCategory(categoryId: string): void {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      this.openCategoryModal(category);
    }
  }

  exportCategories(): void {
    // TODO: Implement category export functionality
    console.log('Export categories functionality not implemented yet');
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

  get paginatedCategories(): Category[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredCategories.slice(start, end);
  }

  closeModalOnOverlay(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeCategoryModal();
    }
  }

  printCategory(): void {
    // TODO: Implement category print functionality
    console.log('Print category functionality not implemented yet');
  }

  get totalProducts(): number {
    return this.categories.reduce((sum, category) => sum + category.productCount, 0);
  }

  get activeCategoryCount(): number {
    return this.categories.filter(c => c.status === 'active').length;
  }
}
