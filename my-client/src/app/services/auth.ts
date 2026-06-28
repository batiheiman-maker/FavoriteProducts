import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environment/environment';
import { LoginResponse } from '../models/login-response.model';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  constructor(private http: HttpClient, private router: Router) {}

  login(userName: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/login`, { userName, password });
  }

  register(userName: string, password: string) {
    return this.http.post(`${environment.apiUrl}/register`, { userName, password });
  }

  // שמירה אחרי login רגיל
saveSession(res: any): void {
  localStorage.setItem('token', res.token);
  localStorage.setItem('userName', res.userName ?? res.UserName);
  localStorage.setItem('role', res.role ?? res.Role);

  const payload = this.decodeToken(res.token);  
 const userId =
  payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

if (userId) localStorage.setItem('userId', userId.toString());
}

  // שמירה אחרי login-as (impersonation)
  saveImpersonation(token: string): void {
  const adminToken = localStorage.getItem('token');

  if (!adminToken) {
    this.router.navigate(['/login']);
    return;
  }

  localStorage.setItem('adminToken', adminToken);
  localStorage.setItem('token', token);

  const payload = this.decodeToken(token);

  if (!payload) {
    return;
  }

  localStorage.setItem(
    'userName',
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ?? ''
  );

  localStorage.setItem('role', 'User');
  localStorage.setItem('isImpersonating', 'true');

  const userId =
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

  if (userId) {
    localStorage.setItem('userId', userId.toString());
  }
}

  getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id) : null;
  }
backToAdmin(): void {
  const adminToken = localStorage.getItem('adminToken');

  if (!adminToken) {
    this.logout();
    return;
  }

  localStorage.setItem('token', adminToken);
  localStorage.removeItem('adminToken');
  localStorage.removeItem('isImpersonating');

  const payload = this.decodeToken(adminToken);

  localStorage.setItem('role', 'Admin');

  if (payload) {
    const userName =
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ?? 'admin';

    const userId =
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

    localStorage.setItem('userName', userName);

    if (userId) {
      localStorage.setItem('userId', userId.toString());
    }
  } else {
    localStorage.setItem('userName', 'admin');
    localStorage.setItem('userId', '0');
  }
}
  getUserName(): string {
    return localStorage.getItem('userName') ?? '';
  }

  getRole(): string {
    return localStorage.getItem('role') ?? '';
  }

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }

  isImpersonating(): boolean {
    return localStorage.getItem('isImpersonating') === 'true';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }
}
