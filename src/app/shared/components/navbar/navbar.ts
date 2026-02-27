import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './navbar.html'
})
export class Navbar {

  @Input() cartItems = 0;
  @Input() userName = 'User';
  @Input() userAvatar = 'https://via.placeholder.com/32x32?text=U';

  showDropdown = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.showDropdown = false;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    this.authService.clearToken();
    this.router.navigate(['/login']);
  }

  onSearchSubmit(input: HTMLInputElement) {
    const value = input.value.trim();
    if (value) {
      this.router.navigate(['/products'], {
        queryParams: { search: value }
      });
    }
  }
}