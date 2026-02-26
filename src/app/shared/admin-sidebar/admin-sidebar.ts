import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
})
export class AdminSidebar {
  @Input() sidebarCollapsed = false;
  @Input() pendingOrders = 0;
  @Output() sidebarToggle = new EventEmitter<void>();

  constructor(private router: Router) {}

  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
}
