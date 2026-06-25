import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductsService } from '../services/product';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {

  users = signal<any[]>([]);
  loading = signal(true);
  errorMsg = signal('');

  constructor(
    private productsService: ProductsService,
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.auth.isAdmin()) {
      this.router.navigate(['/guards']);
      return;
    }

    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.errorMsg.set('');

    this.productsService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('שגיאה בטעינת משתמשים');
        this.loading.set(false);
      }
    });
  }

  loginAs(user: any): void {
    this.productsService.loginAs(user.id).subscribe({
      next: (res: any) => {
        this.auth.saveImpersonation(res.token);
        this.router.navigate(['/products']);
      },
      error: () => {
        alert('שגיאה בכניסה כמשתמש');
      }
    });
  }

  logout(): void {
    this.auth.logout();
  }
}