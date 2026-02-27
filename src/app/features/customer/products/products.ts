import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { RouterLink } from '@angular/router';

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
  stock: number;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar, Footer, ProductCard,RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {

  products: Product[] = [];
  filteredProducts: Product[] = [];
  displayedProducts: Product[] = [];

  filterForm: FormGroup;

  isFilterOpen = true;

  // Infinite scroll
  itemsPerLoad = 8;
  currentIndex = 0;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      search: [''],
      category: [''],
      brand: [''],
      minPrice: [''],
      maxPrice: [''],
      rating: ['']
    });
  }

  ngOnInit(): void {
    this.products = this.generateStaticProducts();
    this.filteredProducts = this.products;
    this.loadMoreProducts();

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  applyFilters() {
    const f = this.filterForm.value;

    this.filteredProducts = this.products.filter(p => {

      if (f.search && !p.name.toLowerCase().includes(f.search.toLowerCase()))
        return false;

      if (f.category && p.category !== f.category)
        return false;

      if (f.brand && p.brand !== f.brand)
        return false;

      if (f.minPrice && p.price < +f.minPrice)
        return false;

      if (f.maxPrice && p.price > +f.maxPrice)
        return false;

      if (f.rating && p.rating < +f.rating)
        return false;

      return true;
    });

    this.displayedProducts = [];
    this.currentIndex = 0;
    this.loadMoreProducts();
  }

  loadMoreProducts() {
    const next = this.filteredProducts.slice(
      this.currentIndex,
      this.currentIndex + this.itemsPerLoad
    );

    this.displayedProducts = [...this.displayedProducts, ...next];
    this.currentIndex += this.itemsPerLoad;
  }

  @HostListener('window:scroll', [])
  onScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
      this.loadMoreProducts();
    }
  }

  toggleFilters() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  clearFilters() {
    this.filterForm.reset();
  }

  private generateStaticProducts(): Product[] {
    const categories = ['Electronics', 'Clothing', 'Sports'];
    const brands = ['Nike', 'Adidas', 'Samsung', 'Apple'];

    const data: Product[] = [];

    for (let i = 1; i <= 40; i++) {
      data.push({
        id: i,
        name: `Product ${i}`,
        price: Math.floor(Math.random() * 500) + 50,
        originalPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 600) + 100 : undefined,
        image: `https://picsum.photos/400?random=${i}`,
        rating: Math.floor(Math.random() * 2) + 3,
        reviews: Math.floor(Math.random() * 300),
        category: categories[Math.floor(Math.random() * categories.length)],
        brand: brands[Math.floor(Math.random() * brands.length)],
        stock: 10
      });
    }

    return data;
  }
}