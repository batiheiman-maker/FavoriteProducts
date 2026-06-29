import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Auth } from '../services/auth';

type LoginState = {
  loading: boolean;
  errorMsg: string;
};

const initialState: LoginState = {
  loading: false,
  errorMsg: '',
};

export const LoginStore = signalStore(
  withState(initialState),

  withMethods((store) => {
    const auth = inject(Auth);
    const router = inject(Router);

    return {
      login(userName: string, password: string): void {
        patchState(store, {
          errorMsg: '',
          loading: true,
        });

        auth.login(userName, password).subscribe({
          next: (res: any) => {
            auth.saveSession(res);

            patchState(store, {
              loading: false,
            });

            if (res.role === 'Admin') {
              router.navigate(['/admin']);
            } else {
              router.navigate(['/products']);
            }
          },

          error: () => {
            patchState(store, {
              errorMsg: 'שם משתמש או סיסמה שגויים',
              loading: false,
            });
          },
        });
      },

      clearError(): void {
        patchState(store, {
          errorMsg: '',
        });
      },
    };
  })
);