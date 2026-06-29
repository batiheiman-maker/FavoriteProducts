import { Component, OnInit, inject } from '@angular/core';
import { AdminStore } from '../stores/admin';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.html',
  styleUrl: './admin.css',
  providers: [AdminStore],
})
export class Admin implements OnInit {
  store = inject(AdminStore);

  ngOnInit(): void {
    this.store.loadUsers();
  }
}