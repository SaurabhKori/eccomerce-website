import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'seller' | 'customer';
  avatar?: string;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  // ============================
  // REAL BACKEND LOGIN
  // ============================
  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, credentials);
  }

  // ============================
  // MOCK LOGIN (FOR TESTING)
  // ============================
  mockLogin(email: string, password: string): Observable<User | null> {

    const mockUsers: User[] = [
      {
        id: 1,
        email: 'admin@ecommerce.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        avatar: 'https://via.placeholder.com/150x150?text=Admin',
        token: 'mock-admin-token'
      },
      {
        id: 2,
        email: 'seller@ecommerce.com',
        firstName: 'Seller',
        lastName: 'User',
        role: 'seller',
        avatar: 'https://via.placeholder.com/150x150?text=Seller',
        token: 'mock-seller-token'
      },
      {
        id: 3,
        email: 'customer@ecommerce.com',
        firstName: 'Customer',
        lastName: 'User',
        role: 'customer',
        avatar: 'https://via.placeholder.com/150x150?text=Customer',
        token: 'mock-customer-token'
      }
    ];

    const user = mockUsers.find(u => u.email === email);

    if (user && password === 'password') {
      return of(user);
    }

    return of(null);
  }

  // ============================
  // TOKEN MANAGEMENT
  // ============================

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  clearToken(): void {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}