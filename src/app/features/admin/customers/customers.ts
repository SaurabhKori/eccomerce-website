import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AdminSidebar } from '../../../shared/admin-sidebar/admin-sidebar';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  avatar: string;
  joinDate: Date;
  lastOrderDate?: Date;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'vip';
  notes?: string;
}

@Component({
  selector: 'app-customers',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AdminSidebar],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  viewMode: 'grid' | 'list' = 'grid';
  searchTerm = '';
  selectedStatus = '';
  selectedCustomerType = '';
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;
  
  // Modal states
  showCustomerModal = false;
  editingCustomer: Customer | null = null;
  saving = false;
  selectedCustomer: Customer | null = null;
  
  // Forms
  customerForm: FormGroup;
  
  // Data
  customers: Customer[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      avatar: 'https://picsum.photos/seed/customer1/200/200.jpg',
      joinDate: new Date('2023-01-15'),
      lastOrderDate: new Date('2024-01-10'),
      totalOrders: 15,
      totalSpent: 2450.75,
      status: 'vip'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 (555) 987-6543',
      address: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'United States',
      avatar: 'https://picsum.photos/seed/customer2/200/200.jpg',
      joinDate: new Date('2023-03-20'),
      lastOrderDate: new Date('2024-01-08'),
      totalOrders: 8,
      totalSpent: 1234.50,
      status: 'active'
    },
    {
      id: 3,
      name: 'Robert Johnson',
      email: 'robert.j@example.com',
      phone: '+1 (555) 456-7890',
      address: '789 Pine Rd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60007',
      country: 'United States',
      avatar: 'https://picsum.photos/seed/customer3/200/200.jpg',
      joinDate: new Date('2023-06-10'),
      lastOrderDate: new Date('2023-12-20'),
      totalOrders: 3,
      totalSpent: 456.25,
      status: 'active'
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      phone: '+1 (555) 321-6549',
      address: '321 Elm St',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'United States',
      avatar: 'https://picsum.photos/seed/customer4/200/200.jpg',
      joinDate: new Date('2023-02-28'),
      lastOrderDate: new Date('2023-11-15'),
      totalOrders: 12,
      totalSpent: 1890.00,
      status: 'vip'
    },
    {
      id: 5,
      name: 'Michael Wilson',
      email: 'michael.w@example.com',
      phone: '+1 (555) 654-3210',
      address: '654 Maple Dr',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'United States',
      avatar: 'https://picsum.photos/seed/customer5/200/200.jpg',
      joinDate: new Date('2023-04-15'),
      lastOrderDate: new Date('2023-10-05'),
      totalOrders: 6,
      totalSpent: 789.50,
      status: 'inactive'
    }
  ];
  
  filteredCustomers: Customer[] = [];
  
  get vipCustomerCount(): number {
    return this.filteredCustomers.filter(c => c.status === 'vip').length;
  }
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['United States', Validators.required],
      status: ['active', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadCustomers(): void {
    // TODO: Replace with actual API call
    this.http.get<Customer[]>('/api/admin/customers').subscribe({
      next: (data) => {
        this.customers = data;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Failed to load customers:', error);
        // Use mock data for now
        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    this.filteredCustomers = this.customers.filter(customer => {
      const matchesSearch = !this.searchTerm || 
        customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customer.phone.includes(this.searchTerm);
      
      const matchesStatus = !this.selectedStatus || customer.status === this.selectedStatus;
      
      const matchesType = !this.selectedCustomerType || 
        (this.selectedCustomerType === 'vip' && customer.status === 'vip') ||
        (this.selectedCustomerType === 'regular' && customer.status !== 'vip');
      
      return matchesSearch && matchesStatus && matchesType;
    });
    
    this.totalPages = Math.ceil(this.filteredCustomers.length / this.itemsPerPage);
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

  onCustomerTypeChange(): void {
    this.applyFilters();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  openCustomerModal(customer?: Customer): void {
    this.editingCustomer = customer || null;
    if (customer) {
      this.customerForm.patchValue({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zipCode: customer.zipCode,
        country: customer.country,
        status: customer.status,
        notes: customer.notes || ''
      });
    } else {
      this.customerForm.reset();
    }
    this.showCustomerModal = true;
  }

  closeCustomerModal(): void {
    this.showCustomerModal = false;
    this.editingCustomer = null;
    this.customerForm.reset();
  }

  saveCustomer(): void {
    if (this.customerForm.valid) {
      this.saving = true;
      const customerData = this.customerForm.value;
      
      if (this.editingCustomer) {
        // Update existing customer
        this.http.put<Customer>(`/api/admin/customers/${this.editingCustomer.id}`, customerData).subscribe({
          next: (updatedCustomer) => {
            const index = this.customers.findIndex(c => c.id === this.editingCustomer!.id);
            if (index !== -1) {
              this.customers[index] = { ...updatedCustomer, id: this.editingCustomer!.id };
            }
            this.applyFilters();
            this.closeCustomerModal();
            this.saving = false;
          },
          error: (error) => {
            console.error('Failed to update customer:', error);
            alert('Failed to update customer. Please try again.');
            this.saving = false;
          }
        });
      } else {
        // Add new customer
        this.http.post<Customer>('/api/admin/customers', customerData).subscribe({
          next: (newCustomer) => {
            this.customers.unshift(newCustomer);
            this.applyFilters();
            this.closeCustomerModal();
            this.saving = false;
          },
          error: (error) => {
            console.error('Failed to create customer:', error);
            alert('Failed to create customer. Please try again.');
            this.saving = false;
          }
        });
      }
    }
  }

  deleteCustomer(customerId: number): void {
    if (confirm('Are you sure you want to delete this customer?')) {
      // TODO: Replace with actual API call
      this.http.delete(`/api/admin/customers/${customerId}`).subscribe({
        next: () => {
          this.customers = this.customers.filter(c => c.id !== customerId);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Failed to delete customer:', error);
          alert('Failed to delete customer. Please try again.');
        }
      });
    }
  }

  viewCustomer(customerId: number): void {
    const customer = this.customers.find(c => c.id === customerId);
    if (customer) {
      this.selectedCustomer = customer;
      this.showCustomerModal = true;
    }
  }

  editCustomer(customerId: number): void {
    const customer = this.customers.find(c => c.id === customerId);
    if (customer) {
      this.openCustomerModal(customer);
    }
  }

  exportCustomers(): void {
    // TODO: Implement customer export functionality
    console.log('Export customers functionality not implemented yet');
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

  get paginatedCustomers(): Customer[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredCustomers.slice(start, end);
  }

  closeModalOnOverlay(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeCustomerModal();
    }
  }

  printCustomer(): void {
    // TODO: Implement customer print functionality
    console.log('Print customer functionality not implemented yet');
  }
}
