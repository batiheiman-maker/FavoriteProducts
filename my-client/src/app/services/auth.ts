import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environment/environment';

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
  console.log('JWT payload:', payload); // תראי לי מה יוצא
  
 const userId =
  payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

if (userId) localStorage.setItem('userId', userId.toString());
}

  // שמירה אחרי login-as (impersonation)
  saveImpersonation(token: string): void {
  localStorage.setItem('token', token);
  const payload = this.decodeToken(token);
  if (payload) {
localStorage.setItem('userName', decodeURIComponent(escape(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ?? '')));    localStorage.setItem('role', 'User');
    localStorage.setItem('isImpersonating', 'true');
    const userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    if (userId) localStorage.setItem('userId', userId.toString());
  }
}

  getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id) : null;
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
