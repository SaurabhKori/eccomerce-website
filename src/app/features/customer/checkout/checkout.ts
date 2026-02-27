import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { UiInputComponent } from '../../../shared/ui/input/ui-input.component';
import { UiCardComponent } from '../../../shared/ui/card/ui-card.component';
import { UiButtonComponent } from '../../../shared/ui/button/ui-button.component';

interface Address {
  id: number;
  type: 'shipping' | 'billing';
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    image: string;
    price: number;
  };
  quantity: number;
}

interface OrderSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Navbar,UiCardComponent,UiButtonComponent,UiInputComponent],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
  sidebarCollapsed = false;
  currentStep = 1;
  totalSteps = 3;
  
  // Forms
  shippingForm: FormGroup;
  billingForm: FormGroup;
  paymentForm: FormGroup;
  
  // Data
  addresses: Address[] = [];
  cartItems: CartItem[] = [];
  orderSummary: OrderSummary = {
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0
  };
  
  // UI State
  loading = false;
  sameAsShipping = true;
  selectedAddressId: number | null = null;
  paymentMethod = 'card';
  
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
    this.shippingForm = this.fb.group({
      name: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['US', Validators.required],
      phone: ['', Validators.required],
      saveAddress: [false]
    });

    this.billingForm = this.fb.group({
      name: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['US', Validators.required],
      phone: ['', Validators.required],
      saveAddress: [false]
    });

    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern('^\\d{16}$')]],
      cardName: ['', Validators.required],
      expiryDate: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])/\\d{2}$')]],
      cvv: ['', [Validators.required, Validators.pattern('^\\d{3,4}$')]],
      saveCard: [false]
    });
  }

  ngOnInit(): void {
    this.loadCheckoutData();
  }

  loadCheckoutData(): void {
    this.loading = true;
    
    // Load addresses, cart items, and order summary in parallel
    this.http.get<Address[]>('/api/addresses').subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        const defaultAddress = addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          this.selectedAddressId = defaultAddress.id;
        }
      },
      error: () => {
        this.addresses = this.generateMockAddresses();
      }
    });

    this.http.get<CartItem[]>('/api/cart').subscribe({
      next: (items) => {
        this.cartItems = items;
        this.calculateOrderSummary();
      },
      error: () => {
        this.cartItems = this.generateMockCartItems();
        this.calculateOrderSummary();
      }
    });

    this.loading = false;
  }

  calculateOrderSummary(): void {
    const subtotal = this.cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    this.orderSummary = { subtotal, tax, shipping, total };
  }

  // Step Navigation
  nextStep(): void {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
    }
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.selectedAddressId !== null || this.shippingForm.valid;
      case 2:
        return this.sameAsShipping || this.billingForm.valid;
      case 3:
        return this.paymentForm.valid;
      default:
        return false;
    }
  }

  // Address Management
  selectAddress(addressId: number): void {
    this.selectedAddressId = addressId;
    const address = this.addresses.find(addr => addr.id === addressId);
    if (address) {
      this.shippingForm.patchValue({
        name: address.name,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone
      });
    }
  }

  addNewAddress(): void {
    this.selectedAddressId = null;
    this.shippingForm.reset({ country: 'US' });
  }

  saveAddress(): void {
    if (this.shippingForm.valid) {
      const addressData = {
        ...this.shippingForm.value,
        type: 'shipping' as const,
        isDefault: this.addresses.length === 0
      };

      this.http.post<Address>('/api/addresses', addressData).subscribe({
        next: (address: Address) => {
          this.addresses.push(address);
          this.selectedAddressId = address.id;
        },
        error: (error) => {
          console.error('Error saving address:', error);
        }
      });
    }
  }

  // Payment Methods
  selectPaymentMethod(method: string): void {
    this.paymentMethod = method;
  }

  // Place Order
  placeOrder(): void {
    this.router.navigate(['/order-success'], { 
          queryParams: { orderId: 1 } 
        });
    if (!this.validateCurrentStep()) return;

    this.loading = true;
    
    const orderData = {
      shippingAddress: this.selectedAddressId ? 
        this.addresses.find(addr => addr.id === this.selectedAddressId) : 
        this.shippingForm.value,
      billingAddress: this.sameAsShipping ? 
        (this.selectedAddressId ? this.addresses.find(addr => addr.id === this.selectedAddressId) : this.shippingForm.value) :
        this.billingForm.value,
      paymentMethod: this.paymentMethod,
      paymentDetails: this.paymentMethod === 'card' ? this.paymentForm.value : null,
      items: this.cartItems,
      summary: this.orderSummary
    };
     this.router.navigate(['/order-success'], { 
          queryParams: { orderId: 1 } 
        });

    // this.http.post('/api/orders', orderData).subscribe({
    //   next: (response: any) => {
    //     this.loading = false;
    //     this.router.navigate(['/order-success'], { 
    //       queryParams: { orderId: response.orderId } 
    //     });
    //   },
    //   error: (error) => {
    //     console.error('Error placing order:', error);
    //     this.loading = false;
    //     alert('Failed to place order. Please try again.');
    //   }
    // });
  }

  // Utility Methods
  formatCurrency(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  // Mock Data Generators
  private generateMockAddresses(): Address[] {
    return [
      {
        id: 1,
        type: 'shipping',
        name: 'John Doe',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
        phone: '+1 (555) 123-4567',
        isDefault: true
      }
    ];
  }

  private generateMockCartItems(): CartItem[] {
    return [
      {
        id: 1,
        product: {
          id: 1,
          name: 'Wireless Headphones',
          image: 'https://via.placeholder.com/100x100',
          price: 79.99
        },
        quantity: 2
      },
      {
        id: 2,
        product: {
          id: 2,
          name: 'Smart Watch',
          image: 'https://via.placeholder.com/100x100',
          price: 199.99
        },
        quantity: 1
      }
    ];
  }
}
