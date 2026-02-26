import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

export interface NavItem {
  path: string;
  label: string;
  icon: string;
  active?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule,RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  @Input() collapsed = false;
  @Input() navItems: NavItem[] = [];
  @Output() toggle = new EventEmitter<void>();

  constructor(private router: Router) {}

  onToggle(): void {
    this.toggle.emit();
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }
}
