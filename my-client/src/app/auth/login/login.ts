import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  errorMsg = '';

  loginForm = new FormGroup({
    userName: new FormControl(''),
    password: new FormControl('')
  });

  constructor(private auth: Auth, private router: Router) {}

  login() {
    this.errorMsg = '';

    const userName = this.loginForm.value.userName ?? '';
    const password = this.loginForm.value.password ?? '';

    this.auth.login(userName, password).subscribe({
      next: (res: any) => {
        console.log('role:', res.Role);

        this.auth.saveSession(res);

        if (res.Role === 'Admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/products']);
        }
      },
      error: () => {
        this.errorMsg = 'שם משתמש או סיסמה שגויים';
      }
    });
  }
}