import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  registerForm = new FormGroup({
    userName: new FormControl(''),
    password: new FormControl('')
  });

  constructor(private auth: Auth, private router: Router) {}

  register() {
    const userName = this.registerForm.value.userName ?? '';
    const password = this.registerForm.value.password ?? '';

    this.auth.register(userName, password).subscribe({
      next: () => {
        alert('נרשמת בהצלחה!');
        this.router.navigate(['/products']);
      },
      error: () => {
        alert('שגיאה בהרשמה');
      }
    });
  }
}