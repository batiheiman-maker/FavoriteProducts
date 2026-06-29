import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ProductsService } from '../services/product';
import { Auth } from '../services/auth';
import { User } from '../models/user';

type AdminState = {
  users: User[];
  loading: boolean;
  errorMsg: string;
};

const initialState: AdminState = {
  users: [],
  loading: false,
  errorMsg: '',
};

export const AdminStore = signalStore(
  withState(initialState),

  withMethods((store) => {
    const productsService = inject(ProductsService);
    const auth = inject(Auth);
    const router = inject(Router);

    return {
      loadUsers(): void {
        patchState(store, {
          loading: true,
          errorMsg: '',
        });

        productsService.getUsers().subscribe({
          next: (users: User[]) => {
            patchState(store, {
              users,
              loading: false,
            });
          },

          error: () => {
            patchState(store, {
              errorMsg: 'שגיאה בטעינת משתמשים',
              loading: false,
            });
          },
        });
      },

      loginAs(userId: number): void {
        patchState(store, {
          errorMsg: '',
        });

        productsService.loginAs(userId).subscribe({
          next: (res: any) => {
            auth.saveImpersonation(res.token);
            router.navigate(['/products']);
          },

          error: () => {
            patchState(store, {
              errorMsg: 'שגיאה בכניסה כמשתמש',
            });
          },
        });
      },

      logout(): void {
        auth.logout();
      },
    };
  })
);