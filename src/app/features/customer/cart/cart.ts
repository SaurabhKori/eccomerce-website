import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { NavItem } from '../../../shared/components/sidebar/sidebar';

interface CartItem {
  id: number;
  productId: number;
  product: {
    id: number;
    name: string;
    image: string;
    price: number;
    stock: number;
  };
  quantity: number;
  addedAt: Date;
}

interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

@Component({
  selector: 'app-cart',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Sidebar],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  sidebarCollapsed = false;
  cartItems: CartItem[] = [];
  cartSummary: CartSummary = {
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0
  };
  loading = false;
  couponForm: FormGroup;
  appliedCoupon: string | null = null;
  couponDiscount = 0;
  
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
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.couponForm = this.fb.group({
      couponCode: ['']
    });
  }

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.http.get<CartItem[]>('/api/cart').subscribe({
      next: (items) => {
        this.cartItems = items;
        this.calculateSummary();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.loading = false;
        // Fallback data
        this.cartItems = this.generateMockCartItems();
        this.calculateSummary();
      }
    });
  }

  updateQuantity(itemId: number, quantity: number): void {
    if (quantity < 1) return;
    
    const item = this.cartItems.find(item => item.id === itemId);
    if (item && quantity <= item.product.stock) {
      this.http.patch(`/api/cart/${itemId}`, { quantity }).subscribe({
        next: () => {
          item.quantity = quantity;
          this.calculateSummary();
        },
        error: (error) => {
          console.error('Error updating quantity:', error);
        }
      });
    }
  }

  removeItem(itemId: number): void {
    this.http.delete(`/api/cart/${itemId}`).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(item => item.id !== itemId);
        this.calculateSummary();
      },
      error: (error) => {
        console.error('Error removing item:', error);
      }
    });
  }

  saveForLater(itemId: number): void {
    // TODO: Implement save for later functionality
    console.log('Saving item for later:', itemId);
  }

  applyCoupon(): void {
    const couponCode = this.couponForm.get('couponCode')?.value;
    if (!couponCode) return;

    this.http.post('/api/coupons/apply', { code: couponCode }).subscribe({
      next: (response: any) => {
        this.appliedCoupon = couponCode;
        this.couponDiscount = response.discount;
        this.calculateSummary();
      },
      error: (error) => {
        console.error('Invalid coupon:', error);
        // Show error message
      }
    });
  }

  removeCoupon(): void {
    this.appliedCoupon = null;
    this.couponDiscount = 0;
    this.couponForm.reset();
    this.calculateSummary();
  }

  calculateSummary(): void {
    const subtotal = this.cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + tax + shipping - this.couponDiscount;

    this.cartSummary = {
      subtotal,
      tax,
      shipping,
      total
    };
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  formatCurrency(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  private generateMockCartItems(): CartItem[] {
    return [
      {
        id: 1,
        productId: 1,
        product: {
          id: 1,
          name: 'Wireless Headphones',
          image: 'https://via.placeholder.com/100x100',
          price: 79.99,
          stock: 15
        },
        quantity: 2,
        addedAt: new Date()
      },
      {
        id: 2,
        productId: 2,
        product: {
          id: 2,
          name: 'Smart Watch',
          image: 'https://via.placeholder.com/100x100',
          price: 199.99,
          stock: 8
        },
        quantity: 1,
        addedAt: new Date()
      },
      {
        id: 3,
        productId: 3,
        product: {
          id: 3,
          name: 'Laptop Stand',
          image: 'https://via.placeholder.com/100x100',
          price: 29.99,
          stock: 25
        },
        quantity: 3,
        addedAt: new Date()
      }
    ];
  }
}
