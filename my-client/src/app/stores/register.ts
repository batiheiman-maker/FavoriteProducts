import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Auth } from '../services/auth';

type RegisterState = {
  loading: boolean;
  errorMsg: string;
  successMsg: string;
};

const initialState: RegisterState = {
  loading: false,
  errorMsg: '',
  successMsg: '',
};

export const RegisterStore = signalStore(
  withState(initialState),

  withMethods((store) => {
    const auth = inject(Auth);
    const router = inject(Router);

    return {
      register(userName: string, password: string): void {
        patchState(store, {
          loading: true,
          errorMsg: '',
          successMsg: '',
        });

        auth.register(userName, password).subscribe({
          next: () => {
            patchState(store, {
              loading: false,
              successMsg: 'נרשמת בהצלחה!',
            });

            router.navigate(['/products']);
          },

          error: () => {
            patchState(store, {
              loading: false,
              errorMsg: 'שגיאה בהרשמה',
            });
          },
        });
      },

      clearMessages(): void {
        patchState(store, {
          errorMsg: '',
          successMsg: '',
        });
      },
    };
  })
);