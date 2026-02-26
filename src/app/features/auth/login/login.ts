
import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const loginData = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      // TODO: Replace with actual API endpoint
      this.http.post('/api/auth/login', loginData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          // Store token and user data
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Navigate to dashboard or home
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login failed:', error);
          // TODO: Show error message to user
        }
      });
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  socialLogin(provider: string): void {
    // TODO: Implement social login
    console.log(`Login with ${provider}`);
  }
}
