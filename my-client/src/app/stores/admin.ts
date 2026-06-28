import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService } from '../services/product';
import { Auth } from '../services/auth';

type AdminUser = {
  id: number;
  userName: string;
};

@Injectable({
  providedIn: 'root'
})
export class AdminStore {
  private productsService = inject(ProductsService);
  private auth = inject(Auth);
  private router = inject(Router);

  users = signal<AdminUser[]>([]);
  loading = signal(false);
  errorMsg = signal('');

  loadUsers(): void {
    this.loading.set(true);
    this.errorMsg.set('');

    this.productsService.getUsers().subscribe({
      next: (users: AdminUser[]) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('שגיאה בטעינת משתמשים');
        this.loading.set(false);
      }
    });
  }

  loginAs(userId: number): void {
    this.errorMsg.set('');

    this.productsService.loginAs(userId).subscribe({
      next: (res: any) => {
        this.auth.saveImpersonation(res.token);
        this.router.navigate(['/products']);
      },
      error: () => {
        this.errorMsg.set('שגיאה בכניסה כמשתמש');
      }
    });
  }

  logout(): void {
    this.auth.logout();
  }
}