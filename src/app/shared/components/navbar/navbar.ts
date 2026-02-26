import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface NavItem {
  path: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  @Input() cartItems = 0;
  @Input() userName = 'John Doe';
  @Input() userAvatar = 'https://via.placeholder.com/32x32?text=User';
  @Input() showMobileMenu = false;
  
  @Output() search = new EventEmitter<string>();
  @Output() toggleMobileMenu = new EventEmitter<void>();
  @Output() userMenuClick = new EventEmitter<void>();

  constructor(private router: Router) {}

  onSearch(event: any): void {
    const searchTerm = event.target.value;
    this.search.emit(searchTerm);
  }

  onSearchSubmit(searchInput: HTMLInputElement): void {
    const searchTerm = searchInput.value;
    this.search.emit(searchTerm);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  toggleMenu(): void {
    this.toggleMobileMenu.emit();
  }

  onUserMenu(): void {
    this.userMenuClick.emit();
  }
}
