import { Component, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService } from '../services/product';
import { Auth } from '../services/auth';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {

  products = signal<any[]>([]);
  loading = signal(true);
  userName = signal('');
  isImpersonating = signal(false);

 hasProducts = computed(() => this.products().length > 0);

  constructor(
    private productsService: ProductsService,
    private auth: Auth,
    private router: Router
  ) {}

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  ngOnInit(): void {
    this.userName.set(this.auth.getUserName());
    this.isImpersonating.set(this.auth.isImpersonating());
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);

    forkJoin({
      products: this.productsService.getProducts(),
      favorites: this.productsService.getFavorites()
    }).subscribe({
      next: ({ products, favorites }) => {
        this.products.set(products.map(p => ({
          ...p,
          isFavorite: favorites.includes(p.id)
        })));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.loading.set(false);
      }
    });
  }

toggleFavorite(product: any): void {
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
      alert('שגיאה בעדכון המועדפים');
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