import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../models/product.model';


@Component({
  selector: 'app-quick-view',
  imports: [CommonModule],
  templateUrl: './quick-view.html',
  styleUrl: './quick-view.css',
})
export class QuickView {
@Input() product!: Product;
  @Output() close = new EventEmitter<void>();
}
