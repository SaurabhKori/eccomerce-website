import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickView } from '../../quick-view/quick-view';
import { UiBadgeComponent } from '../../ui/badge/ui-badge.component';
import { UiCardComponent } from '../../ui/card/ui-card.component';
import { UiButtonComponent } from '../../ui/button/ui-button.component';

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
  stock?: number;
  discount?: number;
  topRated?: boolean;
  wishlisted?: boolean;   // ❤️ for animation state
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule,QuickView,CommonModule,
  UiCardComponent,
  UiButtonComponent,
  UiBadgeComponent],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush   // 🚀 Performance Boost
})
export class ProductCard {

  @Input() product!: Product;
  @Input() showActions = true;
  @Input() compact = false;

  @Output() productClick = new EventEmitter<number>();
  @Output() addToCart = new EventEmitter<Product>();
  @Output() addToWishlist = new EventEmitter<Product>();
  @Output() quickView = new EventEmitter<Product>();

  // ========================
  // Navigation
  // ========================
  onProductClick(): void {
    this.productClick.emit(this.product.id);
  }

  // ========================
  // Cart
  // ========================
  onAddToCart(event: Event): void {
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }

  // ========================
  // Wishlist Toggle
  // ========================
  onAddToWishlist(event: Event): void {
    event.stopPropagation();

    this.product.wishlisted = !this.product.wishlisted; // ❤️ toggle state

    this.addToWishlist.emit(this.product);
  }

  // ========================
  // Quick View
  // ========================
  showQuickView = false;

onQuickView(event: Event): void {
  event.stopPropagation();
  this.showQuickView = true;
}
  // onQuickView(event: Event): void {
  //   event.stopPropagation();
  //   this.quickView.emit(this.product);
  // }

  // ========================
  // Rating Stars (Safe)
  // ========================
// ⭐ Full stars
getFullStars(): number[] {
  const rating = Math.floor(Number(this.product.rating) || 0);
  return this.createArray(rating);
}

// ⭐ Half star
hasHalfStar(): boolean {
  const rating = Number(this.product.rating) || 0;
  return rating % 1 >= 0.5;
}

// ⭐ Empty stars
getEmptyStars(): number[] {
  const rating = Number(this.product.rating) || 0;
  const full = Math.floor(rating);
  const half = this.hasHalfStar() ? 1 : 0;
  return this.createArray(5 - full - half);
}

  createArray(length: any): number[] {
  const safeLength = Number(length);
  if (!Number.isFinite(safeLength) || safeLength <= 0) {
    return [];
  }
  return Array(Math.floor(safeLength)).fill(0);
}

  // ========================
  // Discount Calculation
  // ========================
  getDiscountPercentage(): number {
    if (!this.product.originalPrice) return 0;

    return Math.round(
      ((this.product.originalPrice - this.product.price) /
        this.product.originalPrice) * 100
    );
  }

  // ========================
  // Currency Format
  // ========================
  formatCurrency(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
onBuyNow(event: Event): void {
  event.stopPropagation();
  // this.router.navigate(['/checkout'], {
  //   queryParams: { productId: this.product.id }
  // });
}
  
}