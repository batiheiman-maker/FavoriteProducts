import { Component, OnInit ,ChangeDetectorRef } from '@angular/core';
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

  users: any[] = [];
  loading = true;
  errorMsg = '';

  constructor(
  private productsService: ProductsService,
  private auth: Auth,
  private router: Router,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {
    if (!this.auth.isAdmin()) {
      this.router.navigate(['/guards']);
      return;
    }

    this.productsService.getUsers().subscribe({
      next: (users) => {
       this.users = users;
this.loading = false;
this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'שגיאה בטעינת משתמשים';
        this.loading = false;
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
