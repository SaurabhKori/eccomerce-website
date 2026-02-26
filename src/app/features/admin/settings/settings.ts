import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AdminSidebar } from '../../../shared/admin-sidebar/admin-sidebar';

interface UserSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  timezone: string;
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  twoFactorEnabled: boolean;
}

interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  currency: string;
  taxRate: number;
  shippingCost: number;
}

interface SystemSettings {
  maintenanceMode: boolean;
  debugMode: boolean;
  enableRegistration: boolean;
  enableGuestCheckout: boolean;
  sessionTimeout: number;
  maxFileSize: number;
  backupFrequency: string;
}

@Component({
  selector: 'app-settings',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AdminSidebar],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  activeTab = 'user';
  saving = false;
  saveSuccess = false;
  
  // Forms
  userSettingsForm: FormGroup;
  storeSettingsForm: FormGroup;
  systemSettingsForm: FormGroup;
  
  // Settings data
  userSettings: UserSettings = {
    firstName: 'John',
    lastName: 'Admin',
    email: 'admin@ecommerce.com',
    phone: '+1 (555) 123-4567',
    avatar: 'https://picsum.photos/seed/admin/200/200.jpg',
    timezone: 'UTC-5',
    language: 'en',
    emailNotifications: true,
    pushNotifications: true,
    twoFactorEnabled: false
  };
  
  storeSettings: StoreSettings = {
    storeName: 'E-Commerce Store',
    storeEmail: 'store@ecommerce.com',
    storePhone: '+1 (555) 987-6543',
    address: '123 Business Ave',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
    currency: 'USD',
    taxRate: 8.5,
    shippingCost: 9.99
  };
  
  systemSettings: SystemSettings = {
    maintenanceMode: false,
    debugMode: false,
    enableRegistration: true,
    enableGuestCheckout: true,
    sessionTimeout: 30,
    maxFileSize: 10,
    backupFrequency: 'daily'
  };
  
  // Available options
  timezones = [
    { value: 'UTC-8', label: 'Pacific Time (UTC-8)' },
    { value: 'UTC-5', label: 'Eastern Time (UTC-5)' },
    { value: 'UTC+0', label: 'GMT (UTC+0)' },
    { value: 'UTC+1', label: 'Central European Time (UTC+1)' },
    { value: 'UTC+8', label: 'China Standard Time (UTC+8)' }
  ];
  
  languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'zh', label: 'Chinese' }
  ];
  
  currencies = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yuan (¥)' },
    { value: 'CNY', label: 'Chinese Yuan (¥)' }
  ];
  
  backupFrequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.userSettingsForm = this.fb.group({
      firstName: [this.userSettings.firstName, Validators.required],
      lastName: [this.userSettings.lastName, Validators.required],
      email: [this.userSettings.email, [Validators.required, Validators.email]],
      phone: [this.userSettings.phone, Validators.required],
      avatar: [this.userSettings.avatar],
      timezone: [this.userSettings.timezone, Validators.required],
      language: [this.userSettings.language, Validators.required],
      emailNotifications: [this.userSettings.emailNotifications],
      pushNotifications: [this.userSettings.pushNotifications],
      twoFactorEnabled: [this.userSettings.twoFactorEnabled]
    });
    
    this.storeSettingsForm = this.fb.group({
      storeName: [this.storeSettings.storeName, Validators.required],
      storeEmail: [this.storeSettings.storeEmail, [Validators.required, Validators.email]],
      storePhone: [this.storeSettings.storePhone, Validators.required],
      address: [this.storeSettings.address, Validators.required],
      city: [this.storeSettings.city, Validators.required],
      state: [this.storeSettings.state, Validators.required],
      zipCode: [this.storeSettings.zipCode, Validators.required],
      country: [this.storeSettings.country, Validators.required],
      currency: [this.storeSettings.currency, Validators.required],
      taxRate: [this.storeSettings.taxRate, [Validators.required, Validators.min(0), Validators.max(100)]],
      shippingCost: [this.storeSettings.shippingCost, [Validators.required, Validators.min(0)]]
    });
    
    this.systemSettingsForm = this.fb.group({
      maintenanceMode: [this.systemSettings.maintenanceMode],
      debugMode: [this.systemSettings.debugMode],
      enableRegistration: [this.systemSettings.enableRegistration],
      enableGuestCheckout: [this.systemSettings.enableGuestCheckout],
      sessionTimeout: [this.systemSettings.sessionTimeout, [Validators.required, Validators.min(1), Validators.max(120)]],
      maxFileSize: [this.systemSettings.maxFileSize, [Validators.required, Validators.min(1), Validators.max(100)]],
      backupFrequency: [this.systemSettings.backupFrequency, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadSettings(): void {
    // TODO: Replace with actual API calls
    Promise.all([
      this.loadUserSettings(),
      this.loadStoreSettings(),
      this.loadSystemSettings()
    ]);
  }

  loadUserSettings(): void {
    // TODO: Replace with actual API call
    this.http.get<UserSettings>('/api/admin/settings/user').subscribe({
      next: (data) => {
        this.userSettings = data;
        this.userSettingsForm.patchValue(data);
      },
      error: (error) => {
        console.error('Failed to load user settings:', error);
        // Use mock data for now
        this.userSettingsForm.patchValue(this.userSettings);
      }
    });
  }

  loadStoreSettings(): void {
    // TODO: Replace with actual API call
    this.http.get<StoreSettings>('/api/admin/settings/store').subscribe({
      next: (data) => {
        this.storeSettings = data;
        this.storeSettingsForm.patchValue(data);
      },
      error: (error) => {
        console.error('Failed to load store settings:', error);
        // Use mock data for now
        this.storeSettingsForm.patchValue(this.storeSettings);
      }
    });
  }

  loadSystemSettings(): void {
    // TODO: Replace with actual API call
    this.http.get<SystemSettings>('/api/admin/settings/system').subscribe({
      next: (data) => {
        this.systemSettings = data;
        this.systemSettingsForm.patchValue(data);
      },
      error: (error) => {
        console.error('Failed to load system settings:', error);
        // Use mock data for now
        this.systemSettingsForm.patchValue(this.systemSettings);
      }
    });
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  saveUserSettings(): void {
    if (this.userSettingsForm.valid) {
      this.saving = true;
      const settingsData = this.userSettingsForm.value;
      
      // TODO: Replace with actual API call
      this.http.put('/api/admin/settings/user', settingsData).subscribe({
        next: () => {
          this.userSettings = { ...this.userSettings, ...settingsData };
          this.showSaveSuccess();
        },
        error: (error) => {
          console.error('Failed to save user settings:', error);
          alert('Failed to save user settings. Please try again.');
        }
      }).add(() => {
        this.saving = false;
      });
    }
  }

  saveStoreSettings(): void {
    if (this.storeSettingsForm.valid) {
      this.saving = true;
      const settingsData = this.storeSettingsForm.value;
      
      // TODO: Replace with actual API call
      this.http.put('/api/admin/settings/store', settingsData).subscribe({
        next: () => {
          this.storeSettings = { ...this.storeSettings, ...settingsData };
          this.showSaveSuccess();
        },
        error: (error) => {
          console.error('Failed to save store settings:', error);
          alert('Failed to save store settings. Please try again.');
        }
      }).add(() => {
        this.saving = false;
      });
    }
  }

  saveSystemSettings(): void {
    if (this.systemSettingsForm.valid) {
      this.saving = true;
      const settingsData = this.systemSettingsForm.value;
      
      // TODO: Replace with actual API call
      this.http.put('/api/admin/settings/system', settingsData).subscribe({
        next: () => {
          this.systemSettings = { ...this.systemSettings, ...settingsData };
          this.showSaveSuccess();
        },
        error: (error) => {
          console.error('Failed to save system settings:', error);
          alert('Failed to save system settings. Please try again.');
        }
      }).add(() => {
        this.saving = false;
      });
    }
  }

  showSaveSuccess(): void {
    this.saveSuccess = true;
    setTimeout(() => {
      this.saveSuccess = false;
    }, 3000);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  resetForm(formType: string): void {
    if (formType === 'user') {
      this.userSettingsForm.patchValue(this.userSettings);
    } else if (formType === 'store') {
      this.storeSettingsForm.patchValue(this.storeSettings);
    } else if (formType === 'system') {
      this.systemSettingsForm.patchValue(this.systemSettings);
    }
  }

  exportSettings(): void {
    // TODO: Implement settings export functionality
    console.log('Export settings functionality not implemented yet');
  }

  importSettings(): void {
    // TODO: Implement settings import functionality
    console.log('Import settings functionality not implemented yet');
  }

  clearCache(): void {
    // TODO: Implement cache clearing functionality
    console.log('Clear cache functionality not implemented yet');
  }

  runBackup(): void {
    // TODO: Implement manual backup functionality
    console.log('Run backup functionality not implemented yet');
  }
}
