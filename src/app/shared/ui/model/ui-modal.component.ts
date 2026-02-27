import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open"
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">

        <button
          class="absolute top-3 right-3 text-gray-500 hover:text-black"
          (click)="close.emit()">
          ✖
        </button>

        <ng-content></ng-content>

      </div>
    </div>
  `
})
export class UiModalComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
}