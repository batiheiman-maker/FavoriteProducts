import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

import { ProductsService } from '../services/product';
import { Auth } from '../services/auth';
import { Product } from '../models/product';

type ProductsState = {
  products: Product[];
  loading: boolean;
  errorMsg: string;
  userName: string;
  isImpersonating: boolean;
  isAdmin: boolean;
  searchText: string;
};

const initialState: ProductsState = {
  products: [],
  loading: false,
  errorMsg: '',
  userName: '',
  isImpersonating: false,
  isAdmin: false,
  searchText:  ''
};

export const ProductsStore = signalStore(
  withState(initialState),

  withComputed((store) => ({
    hasProducts: computed(() => store.products().length > 0),
      filteredProducts: computed(() => {
    const searchText = store.searchText().trim().toLowerCase();

    if (!searchText) {
      return store.products();
    }

    return store.products().filter(product =>
      product.productName.toLowerCase().includes(searchText)
    );
  }),
  })),

  withMethods((store) => {
    const productsService = inject(ProductsService);
    const auth = inject(Auth);
    const router = inject(Router);

    return {
      initPage(): void {
        patchState(store, {
          userName: auth.getUserName(),
          isImpersonating: auth.isImpersonating(),
          isAdmin: auth.isAdmin(),
        });

        this.loadAll();
      },

      loadAll(): void {
        patchState(store, {
          loading: true,
          errorMsg: '',
        });

        forkJoin({
          products: productsService.getProducts(),
          favorites: productsService.getFavorites(),
        }).subscribe({
          next: ({ products, favorites }) => {
            const productsWithFavorites: Product[] = products.map((product: any) => ({
              ...product,
              isFavorite: favorites.includes(product.id),
            }));

            patchState(store, {
              products: productsWithFavorites,
              loading: false,
            });
          },

          error: (err) => {
            console.error('Error loading data:', err);

            patchState(store, {
              errorMsg: 'שגיאה בטעינת מוצרים',
              loading: false,
            });
          },
        });
      },

      toggleFavorite(product: Product): void {
        patchState(store, {
          errorMsg: '',
        });

        const action$ = product.isFavorite
          ? productsService.removeFavorite(product.id)
          : productsService.addFavorite(product.id);

        const newValue = !product.isFavorite;

        action$.subscribe({
          next: () => {
            const updatedProducts = store.products().map((p) =>
              p.id === product.id
                ? { ...p, isFavorite: newValue }
                : p
            );

            patchState(store, {
              products: updatedProducts,
            });
          },

          error: () => {
            patchState(store, {
              errorMsg: 'שגיאה בעדכון המועדפים',
            });
          },
        });
      },

      logout(): void {
        auth.logout();
      },

      goToAdmin(): void {
        router.navigate(['/admin']);
      },

      backToAdmin(): void {
        auth.backToAdmin();
        router.navigate(['/admin']);
      },
      setSearchText(searchText: string): void {
  patchState(store, { searchText });
}
    };
  })
);