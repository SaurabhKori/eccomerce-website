import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [ngClass]="buttonClasses"
      [disabled]="disabled">
      <ng-content></ng-content>
    </button>
  `
})
export class UiButtonComponent {

  @Input() variant: 'primary' | 'secondary' | 'outline' |'danger' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;

  get buttonClasses(): string {

    const base =
      'rounded-lg font-semibold transition duration-300 focus:outline-none';

    const variants = {
      primary: 'bg-orange-500 hover:bg-orange-600 text-white',
      secondary: 'border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white',
      outline: 'border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white',
      danger: 'bg-red-500 hover:bg-red-600 text-white'
    };

    const sizes = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    return `${base} ${variants[this.variant]} ${sizes[this.size]}`;
  }
}