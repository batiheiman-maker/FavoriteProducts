import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Products } from './products/products';
import { Admin } from './admin/admin';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
    { path: 'products', component: Products },{ path: 'admin', component: Admin },
    {path: '**',redirectTo: 'login'}

];