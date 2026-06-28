import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProductsService } from '../services/product';
import { Auth } from '../services/auth';

type Product = {
  id: number;
  name: string;
  price?: number;
  imageUrl?: string;
  isFavorite: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class ProductsStore {
  private productsService = inject(ProductsService);
  private auth = inject(Auth);
  private router = inject(Router);

  products = signal<Product[]>([]);
  loading = signal(false);
  errorMsg = signal('');

  userName = signal('');
  isImpersonating = signal(false);
  isAdmin = signal(false);

  hasProducts = computed(() => this.products().length > 0);

  initPage(): void {
    this.userName.set(this.auth.getUserName());
    this.isImpersonating.set(this.auth.isImpersonating());
    this.isAdmin.set(this.auth.isAdmin());

    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.errorMsg.set('');

    forkJoin({
      products: this.productsService.getProducts(),
      favorites: this.productsService.getFavorites()
    }).subscribe({
      next: ({ products, favorites }) => {
        const productsWithFavorites = products.map((product: any) => ({
          ...product,
          isFavorite: favorites.includes(product.id)
        }));

        this.products.set(productsWithFavorites);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading data:', err);

        this.errorMsg.set('שגיאה בטעינת מוצרים');
        this.loading.set(false);
      }
    });
  }

  toggleFavorite(product: Product): void {
    this.errorMsg.set('');

    const action$ = product.isFavorite
      ? this.productsService.removeFavorite(product.id)
      : this.productsService.addFavorite(product.id);

    const newValue = !product.isFavorite;

    action$.subscribe({
      next: () => {
        this.products.update(list =>
          list.map(p =>
            p.id === product.id
              ? { ...p, isFavorite: newValue }
              : p
          )
        );
      },
      error: () => {
        this.errorMsg.set('שגיאה בעדכון המועדפים');
      }
    });
  }

  logout(): void {
    this.auth.logout();
  }

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  backToAdmin(): void {
    this.auth.backToAdmin();
    this.router.navigate(['/admin']);
  }
}