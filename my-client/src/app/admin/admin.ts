import { Component, inject } from '@angular/core';
import { AdminStore } from '../stores/admin';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.html',
  styleUrl: './admin.css',
  providers: [AdminStore],
})
export class Admin {
  readonly store = inject(AdminStore);
}