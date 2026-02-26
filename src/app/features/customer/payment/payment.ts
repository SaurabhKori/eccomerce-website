import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { NavItem } from '../../../shared/components/sidebar/sidebar';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
}

interface OrderSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

@Component({
  selector: 'app-payment',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Sidebar],
  templateUrl: './payment.html',
  styleUrl: './payment.css'
})
export class Payment implements OnInit {
  sidebarCollapsed = false;
  orderId: string | null = null;
  amount: number = 0;
  selectedMethod: string = 'card';
  processing = false;
  
  // Forms
  cardForm: FormGroup;
  upiForm: FormGroup;
  netBankingForm: FormGroup;
  
  // Data
  paymentMethods: PaymentMethod[] = [];
  orderSummary: OrderSummary = {
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0
  };
  
  // UI State
  showSavedCards = false;
  savedCards: any[] = [];
  
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
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.cardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern('^\\d{16}$')]],
      cardName: ['', Validators.required],
      expiryDate: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])/\\d{2}$')]],
      cvv: ['', [Validators.required, Validators.pattern('^\\d{3,4}$')]],
      saveCard: [false]
    });

    this.upiForm = this.fb.group({
      upiId: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$')]],
      saveUpi: [false]
    });

    this.netBankingForm = this.fb.group({
      bank: ['', Validators.required],
      saveBank: [false]
    });
  }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.queryParamMap.get('orderId');
    this.amount = parseFloat(this.route.snapshot.queryParamMap.get('amount') || '0');
    
    this.loadPaymentData();
  }

  loadPaymentData(): void {
    // Load payment methods
    this.paymentMethods = [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        icon: 'fas fa-credit-card',
        description: 'Visa, Mastercard, Amex, Discover',
        enabled: true
      },
      {
        id: 'upi',
        name: 'UPI',
        icon: 'fas fa-mobile-alt',
        description: 'Pay with UPI apps',
        enabled: true
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        icon: 'fas fa-university',
        description: 'Pay from your bank account',
        enabled: true
      },
      {
        id: 'wallet',
        name: 'Mobile Wallet',
        icon: 'fas fa-wallet',
        description: 'Paytm, PhonePe, Amazon Pay',
        enabled: true
      },
      {
        id: 'cod',
        name: 'Cash on Delivery',
        icon: 'fas fa-money-bill-wave',
        description: 'Pay when you receive',
        enabled: this.amount < 10000 // COD limit
      }
    ];

    // Calculate order summary
    const subtotal = this.amount;
    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 9.99;
    const total = subtotal + tax + shipping;

    this.orderSummary = { subtotal, tax, shipping, total };

    // Load saved cards
    this.loadSavedCards();
  }

  loadSavedCards(): void {
    this.http.get<any[]>('/api/payment/saved-cards').subscribe({
      next: (cards) => {
        this.savedCards = cards;
        this.showSavedCards = cards.length > 0;
      },
      error: () => {
        // Mock saved cards
        this.savedCards = [
          {
            id: 'card1',
            last4: '1234',
            brand: 'visa',
            expiry: '12/25',
            name: 'John Doe'
          }
        ];
        this.showSavedCards = this.savedCards.length > 0;
      }
    });
  }

  selectPaymentMethod(methodId: string): void {
    this.selectedMethod = methodId;
  }

  selectSavedCard(cardId: string): void {
    // Handle saved card selection
    console.log('Selected saved card:', cardId);
  }

  processPayment(): void {
    if (this.processing) return;

    this.processing = true;

    let paymentData: any = {
      orderId: this.orderId,
      amount: this.orderSummary.total,
      method: this.selectedMethod
    };

    // Add method-specific data
    switch (this.selectedMethod) {
      case 'card':
        if (this.cardForm.valid) {
          paymentData.cardDetails = this.cardForm.value;
        } else {
          this.processing = false;
          this.markFormGroupTouched(this.cardForm);
          return;
        }
        break;
      case 'upi':
        if (this.upiForm.valid) {
          paymentData.upiDetails = this.upiForm.value;
        } else {
          this.processing = false;
          this.markFormGroupTouched(this.upiForm);
          return;
        }
        break;
      case 'netbanking':
        if (this.netBankingForm.valid) {
          paymentData.bankDetails = this.netBankingForm.value;
        } else {
          this.processing = false;
          this.markFormGroupTouched(this.netBankingForm);
          return;
        }
        break;
    }

    this.http.post('/api/payment/process', paymentData).subscribe({
      next: (response: any) => {
        this.processing = false;
        if (response.success) {
          this.router.navigate(['/order-success'], { 
            queryParams: { orderId: this.orderId } 
          });
        } else {
          alert('Payment failed. Please try again.');
        }
      },
      error: (error) => {
        console.error('Payment error:', error);
        this.processing = false;
        
        // Simulate payment success for demo
        setTimeout(() => {
          this.router.navigate(['/order-success'], { 
            queryParams: { orderId: this.orderId } 
          });
        }, 2000);
      }
    });
  }

  cancelPayment(): void {
    if (confirm('Are you sure you want to cancel this payment?')) {
      this.router.navigate(['/cart']);
    }
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

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
