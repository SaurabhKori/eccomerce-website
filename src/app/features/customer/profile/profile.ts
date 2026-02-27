import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { UiButtonComponent } from '../../../shared/ui/button/ui-button.component';
import { UiCardComponent } from '../../../shared/ui/card/ui-card.component';
import { UiInputComponent } from '../../../shared/ui/input/ui-input.component';
import { UiBadgeComponent } from '../../../shared/ui/badge/ui-badge.component';

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

interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiry: string;
  name: string;
}

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  avatar: string;
  joinDate: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UiButtonComponent,UiCardComponent, UiInputComponent,UiBadgeComponent, Navbar, Footer],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  sidebarCollapsed = false;
  activeTab = 'personal';
  
  // Data
  userProfile: UserProfile | null = null;
  addresses: Address[] = [];
  savedCards: SavedCard[] = [];
  
  // Forms
  personalForm: FormGroup;
  passwordForm: FormGroup;
  addressForm: FormGroup;
   previewImage: string | ArrayBuffer | null = null;
selectedFile: File | null = null;
  // UI State
  loading = false;
  saving = false;
  showAddressForm = false;
  editingAddress: Address | null = null;
  
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
    this.personalForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      dateOfBirth: [''],
      gender: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });

    this.addressForm = this.fb.group({
      type: ['shipping'],
      name: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['US', Validators.required],
      phone: ['', Validators.required],
      isDefault: [false]
    });
  }

  ngOnInit(): void {
    this.loadProfileData();
  }

  loadProfileData(): void {
    this.loading = true;
    
    // Load profile, addresses, and saved cards in parallel
    this.http.get<UserProfile>('/api/profile').subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.personalForm.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth,
          gender: profile.gender
        });
      },
      error: () => {
        this.userProfile = this.generateMockProfile();
      }
    });

    this.http.get<Address[]>('/api/addresses').subscribe({
      next: (addresses) => {
        this.addresses = addresses;
      },
      error: () => {
        this.addresses = this.generateMockAddresses();
      }
    });

    this.http.get<SavedCard[]>('/api/payment/saved-cards').subscribe({
      next: (cards) => {
        this.savedCards = cards;
      },
      error: () => {
        this.savedCards = this.generateMockSavedCards();
      }
    });

    this.loading = false;
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  updatePersonalInfo(): void {
    if (this.personalForm.invalid || this.saving) return;

    this.saving = true;
    this.http.put('/api/profile', this.personalForm.value).subscribe({
      next: () => {
        this.saving = false;
        alert('Profile updated successfully!');
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.saving = false;
        alert('Failed to update profile. Please try again.');
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.saving) return;

    this.saving = true;
    this.http.post('/api/profile/change-password', this.passwordForm.value).subscribe({
      next: () => {
        this.saving = false;
        this.passwordForm.reset();
        alert('Password changed successfully!');
      },
      error: (error) => {
        console.error('Error changing password:', error);
        this.saving = false;
        alert('Failed to change password. Please try again.');
      }
    });
  }

  addAddress(): void {
    this.editingAddress = null;
    this.addressForm.reset({ type: 'shipping', country: 'US', isDefault: false });
    this.showAddressForm = true;
  }

  editAddress(address: Address): void {
    this.editingAddress = address;
    this.addressForm.patchValue(address);
    this.showAddressForm = true;
  }

  saveAddress(): void {
    if (this.addressForm.invalid || this.saving) return;

    this.saving = true;
    const addressData = this.addressForm.value;

    if (this.editingAddress) {
      // Update existing address
      this.http.put(`/api/addresses/${this.editingAddress.id}`, addressData).subscribe({
        next: () => {
          const index = this.addresses.findIndex(a => a.id === this.editingAddress!.id);
          if (index !== -1) {
            this.addresses[index] = { ...addressData, id: this.editingAddress!.id };
          }
          this.cancelAddressForm();
          this.saving = false;
          alert('Address updated successfully!');
        },
        error: (error) => {
          console.error('Error updating address:', error);
          this.saving = false;
          alert('Failed to update address. Please try again.');
        }
      });
    } else {
      // Add new address
      this.http.post<Address>('/api/addresses', addressData).subscribe({
        next: (address) => {
          this.addresses.push(address);
          this.cancelAddressForm();
          this.saving = false;
          alert('Address added successfully!');
        },
        error: (error) => {
          console.error('Error adding address:', error);
          this.saving = false;
          alert('Failed to add address. Please try again.');
        }
      });
    }
  }

  deleteAddress(addressId: number): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.http.delete(`/api/addresses/${addressId}`).subscribe({
        next: () => {
          this.addresses = this.addresses.filter(a => a.id !== addressId);
          alert('Address deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting address:', error);
          alert('Failed to delete address. Please try again.');
        }
      });
    }
  }

  setDefaultAddress(addressId: number): void {
    this.http.patch(`/api/addresses/${addressId}/default`, {}).subscribe({
      next: () => {
        this.addresses.forEach(address => {
          address.isDefault = address.id === addressId;
        });
        alert('Default address updated successfully!');
      },
      error: (error) => {
        console.error('Error setting default address:', error);
        alert('Failed to set default address. Please try again.');
      }
    });
  }

  deleteSavedCard(cardId: string): void {
    if (confirm('Are you sure you want to delete this saved card?')) {
      this.http.delete(`/api/payment/saved-cards/${cardId}`).subscribe({
        next: () => {
          this.savedCards = this.savedCards.filter(c => c.id !== cardId);
          alert('Card deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting card:', error);
          alert('Failed to delete card. Please try again.');
        }
      });
    }
  }

  cancelAddressForm(): void {
    this.showAddressForm = false;
    this.editingAddress = null;
    this.addressForm.reset({ type: 'shipping', country: 'US', isDefault: false });
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.http.post('/api/auth/logout', {}).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: () => {
          this.router.navigate(['/login']);
        }
      });
    }
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  private generateMockProfile(): UserProfile {
    return {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1990-01-15',
      gender: 'male',
      avatar: 'https://via.placeholder.com/150x150?text=Avatar',
      joinDate: '2023-01-15'
    };
  }

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
      },
      {
        id: 2,
        type: 'billing',
        name: 'John Doe',
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'US',
        phone: '+1 (555) 123-4567',
        isDefault: false
      }
    ];
  }

  private generateMockSavedCards(): SavedCard[] {
    return [
      {
        id: 'card1',
        last4: '1234',
        brand: 'visa',
        expiry: '12/25',
        name: 'John Doe'
      },
      {
        id: 'card2',
        last4: '5678',
        brand: 'mastercard',
        expiry: '09/24',
        name: 'John Doe'
      }
    ];
  }
 onImageSelected(event: Event): void {
  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) {
    return;
  }

  const file = input.files[0];

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file.');
    return;
  }

  // Optional: Validate size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    alert('Image size should be less than 2MB.');
    return;
  }

  this.selectedFile = file;

  const reader = new FileReader();

  reader.onload = () => {
    this.previewImage = reader.result;
  };

  reader.readAsDataURL(file);
}
}
