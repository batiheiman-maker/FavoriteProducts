import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductsService } from '../services/product';
import { Auth } from '../services/auth';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {

  products: any[] = [];
  userId!: number;
  userName = '';
  isImpersonating = false;
  loading = true;

  constructor(
  private productsService: ProductsService,
  private auth: Auth,
  private router: Router,
  private cdr: ChangeDetectorRef
) {}
isAdmin(): boolean {
  return this.auth.isAdmin();
}
  ngOnInit(): void {
    
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.userId = this.auth.getUserId()!;
    this.userName = this.auth.getUserName();
    this.isImpersonating = this.auth.isImpersonating();

    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;

    // טעינת מוצרים ומועדפים במקביל
    forkJoin({
      products: this.productsService.getProducts(),
      favorites: this.productsService.getFavorites()
    }).subscribe({
      next: ({ products, favorites }) => {
         console.log('products:', products);
    console.log('favorites:', favorites);
        // getFavorites מחזיר number[] — מזהי מוצרים ישירות
        this.products = products.map(p => ({
          ...p,
          isFavorite: favorites.includes(p.id)
        }));
 this.loading = false;
this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading data:', err);
this.loading = false;
this.cdr.detectChanges();      }
    });
  }

  toggleFavorite(product: any): void {
    if (product.isFavorite) {
      this.productsService.removeFavorite( product.id).subscribe();
    } else {
      this.productsService.addFavorite( product.id).subscribe();
    }
    product.isFavorite = !product.isFavorite;
  }

  logout(): void {
    this.auth.logout();
  }

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }
}
