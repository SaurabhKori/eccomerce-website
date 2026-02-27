import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 p-6">
      <ng-content></ng-content>
    </div>
  `
})
export class UiCardComponent {}