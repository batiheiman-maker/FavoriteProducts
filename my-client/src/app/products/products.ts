import { Component, OnInit, inject } from '@angular/core';
import { ProductsStore } from '../stores/products';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-products',
  standalone: true,
  templateUrl: './products.html',
  styleUrl: './products.css',
  providers: [ProductsStore],
  imports:[ReactiveFormsModule]
})
export class Products implements OnInit {
  store = inject(ProductsStore);
searchControl = new FormControl('');
  ngOnInit(): void {
    this.store.initPage();
      this.searchControl.valueChanges.subscribe((value) => {
    this.store.setSearchText(value ?? '');
  });
  }
}