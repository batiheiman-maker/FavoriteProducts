import { Component, OnInit, inject } from '@angular/core';
import { ProductsStore } from '../stores/products';

@Component({
  selector: 'app-products',
  standalone: true,
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {
  store = inject(ProductsStore);

  ngOnInit(): void {
    this.store.initPage();
  }
}