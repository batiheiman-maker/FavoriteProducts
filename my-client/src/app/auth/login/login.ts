import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LoginStore } from '../../stores/login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  providers: [LoginStore],
  styleUrl: './login.css'
})
export class Login {
  store = inject(LoginStore);

  loginForm = new FormGroup({
    userName: new FormControl(''),
    password: new FormControl('')
  });

  login(): void {
    const userName = this.loginForm.value.userName ?? '';
    const password = this.loginForm.value.password ?? '';

    this.store.login(userName, password);
  }
}