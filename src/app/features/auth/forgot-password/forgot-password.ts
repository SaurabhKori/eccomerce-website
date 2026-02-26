import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  emailSent = false;
  resendDisabled = false;
  countdown = 60;
  private countdownInterval: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      const email = this.forgotPasswordForm.value.email;

      // TODO: Replace with actual API endpoint
      this.http.post('/api/auth/forgot-password', { email }).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.emailSent = true;
          this.startCountdown();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Failed to send reset email:', error);
          // TODO: Show error message to user
        }
      });
    }
  }

  resendEmail(): void {
    if (!this.resendDisabled) {
      this.emailSent = false;
      this.onSubmit();
    }
  }

  private startCountdown(): void {
    this.countdown = 60;
    this.resendDisabled = true;

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.resendDisabled = false;
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
