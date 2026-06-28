import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Products } from './products/products';
import { Admin } from './admin/admin';
import {adminGuard} from './guards/auth.guard'
import {authGuard} from './guards/auth.guard'

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
    { path: 'products', component: Products , canActivate: [authGuard]},
    { path: 'admin', component: Admin,canActivate: [authGuard,adminGuard] },
    {path: '**',redirectTo: 'login'}

];