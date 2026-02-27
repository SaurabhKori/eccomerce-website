import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-1 w-full">
      <label *ngIf="label" class="text-sm font-medium text-gray-600">
        {{ label }}
      </label>

      <input
        [type]="type"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
        [placeholder]="placeholder"
        class="border rounded-lg px-4 py-2
               focus:ring-2 focus:ring-orange-400
               focus:outline-none transition"
      />
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputComponent),
      multi: true
    }
  ]
})
export class UiInputComponent implements ControlValueAccessor {

  @Input() label?: string;
  @Input() placeholder = '';
  @Input() type = 'text';

  value: any = '';

  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }
}