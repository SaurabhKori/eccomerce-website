import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [ngClass]="badgeClasses">
      <ng-content></ng-content>
    </span>
  `
})
export class UiBadgeComponent {

  @Input() variant: 'primary' | 'success' | 'danger' | 'warning' = 'primary';

  get badgeClasses(): string {

    const base = 'px-3 py-1 rounded-full text-xs font-semibold';

    const variants = {
      primary: 'bg-orange-500 text-white',
      success: 'bg-green-500 text-white',
      danger: 'bg-red-500 text-white',
      warning: 'bg-yellow-400 text-black'
    };

    return `${base} ${variants[this.variant]}`;
  }
}