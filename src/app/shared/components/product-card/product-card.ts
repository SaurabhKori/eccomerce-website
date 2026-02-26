import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Product {
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

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard {
  @Input() product!: Product;
  @Input() showActions = true;
  @Input() compact = false;
  
  @Output() productClick = new EventEmitter<number>();
  @Output() addToCart = new EventEmitter<Product>();
  @Output() addToWishlist = new EventEmitter<Product>();
  @Output() quickView = new EventEmitter<Product>();

  onProductClick(): void {
    this.productClick.emit(this.product.id);
  }

  onAddToCart(event: Event): void {
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }

  onAddToWishlist(event: Event): void {
    event.stopPropagation();
    this.addToWishlist.emit(this.product);
  }

  onQuickView(event: Event): void {
    event.stopPropagation();
    this.quickView.emit(this.product);
  }

  getDiscountPercentage(): number {
    if (!this.product.originalPrice || !this.product.discount) {
      return 0;
    }
    return Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100);
  }

  formatCurrency(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
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

  getRatingStars(rating: number): any[] {
    return this.createArray(Math.floor(rating || 0));
  }
}
