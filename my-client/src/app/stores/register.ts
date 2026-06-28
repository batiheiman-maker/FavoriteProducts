import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class RegisterStore {
  private auth = inject(Auth);
  private router = inject(Router);

  loading = signal(false);
  errorMsg = signal('');
  successMsg = signal('');

  register(userName: string, password: string): void {
    this.loading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.auth.register(userName, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('נרשמת בהצלחה!');
        this.router.navigate(['/products']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('שגיאה בהרשמה');
      }
    });
  }
}