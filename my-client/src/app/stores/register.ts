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

  withProps(() => ({
    registerForm: new FormGroup({
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
      register(): void {
        if (store.registerForm.invalid || store.loading()) {
          store.registerForm.markAllAsTouched();
          return;
        }

        const { userName, password } = store.registerForm.getRawValue();

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