import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductsStore } from '../stores/products';

@Component({
  selector: 'app-products',
  standalone: true,
  templateUrl: './products.html',
  styleUrl: './products.css',
  providers: [ProductsStore],
  imports: [ReactiveFormsModule],
})
export class Products {
  readonly store = inject(ProductsStore);
}