import { inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  patchState,
  signalStore,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';

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

  withProps(() => ({
    loginForm: new FormGroup({
      userName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    }),
  })),

  withMethods((store) => {
    const auth = inject(Auth);
    const router = inject(Router);

    return {
      login(): void {
        if (store.loginForm.invalid || store.loading()) {
          store.loginForm.markAllAsTouched();
          return;
        }

        const { userName, password } = store.loginForm.getRawValue();

        patchState(store, {
          loading: true,
          errorMsg: '',
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
              loading: false,
              errorMsg: 'שם משתמש או סיסמה שגויים',
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