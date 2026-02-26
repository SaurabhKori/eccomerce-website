import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'seller' | 'customer';
  avatar?: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null>;

  constructor() {
    this.currentUser$ = this.currentUserSubject.asObservable();
    
    // Check for stored user on initialization
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  public get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(user: User): void {
    // Store user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout(): void {
    // Remove user from localStorage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  isSeller(): boolean {
    return this.currentUser?.role === 'seller';
  }

  isCustomer(): boolean {
    return this.currentUser?.role === 'customer';
  }

  // Mock login method for testing
  mockLogin(email: string, password: string): User | null {
    // Mock users for testing
    const mockUsers: User[] = [
      {
        id: 1,
        email: 'admin@ecommerce.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        avatar: 'https://via.placeholder.com/150x150?text=Admin'
      },
      {
        id: 2,
        email: 'seller@ecommerce.com',
        firstName: 'Seller',
        lastName: 'User',
        role: 'seller',
        avatar: 'https://via.placeholder.com/150x150?text=Seller'
      },
      {
        id: 3,
        email: 'customer@ecommerce.com',
        firstName: 'Customer',
        lastName: 'User',
        role: 'customer',
        avatar: 'https://via.placeholder.com/150x150?text=Customer'
      }
    ];

    const user = mockUsers.find(u => u.email === email);
    if (user && password === 'password') {
      this.login(user);
      return user;
    }
    
    return null;
  }
}
