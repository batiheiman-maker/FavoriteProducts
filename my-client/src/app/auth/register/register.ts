import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RegisterStore } from '../../stores/register';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  store = inject(RegisterStore);

  registerForm = new FormGroup({
    userName: new FormControl(''),
    password: new FormControl('')
  });

  register(): void {
    const userName = this.registerForm.value.userName ?? '';
    const password = this.registerForm.value.password ?? '';

    this.store.register(userName, password);
  }
}