import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environment/environment';
import { LoginResponse } from '../models/login-response';

type JwtPayload = {
  exp?: number;
  [key: string]: any;
};

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly tokenKey = 'token';
  private readonly adminTokenKey = 'adminToken';
  private readonly userNameKey = 'userName';
  private readonly roleKey = 'role';
  private readonly userIdKey = 'userId';
  private readonly isImpersonatingKey = 'isImpersonating';

  constructor(private http: HttpClient, private router: Router) {}

  login(userName: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/login`, { userName, password });
  }

  register(userName: string, password: string) {
    return this.http.post(`${environment.apiUrl}/register`, { userName, password });
  }

  saveSession(res: LoginResponse): void {
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem(this.userNameKey, res.userName ?? res.UserName ?? '');
    localStorage.setItem(this.roleKey, res.role ?? res.Role ?? '');

    const payload = this.decodeToken(res.token);

    const userId =
      payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

    if (userId) {
      localStorage.setItem(this.userIdKey, userId.toString());
    }
  }

  saveImpersonation(token: string): void {
    const adminToken = localStorage.getItem(this.tokenKey);

    if (!adminToken || this.isTokenExpired(adminToken)) {
      this.logout();
      return;
    }

    localStorage.setItem(this.adminTokenKey, adminToken);
    localStorage.setItem(this.tokenKey, token);

    const payload = this.decodeToken(token);

    if (!payload || this.isTokenExpired(token)) {
      this.logout();
      return;
    }

    localStorage.setItem(
      this.userNameKey,
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ?? ''
    );

    localStorage.setItem(this.roleKey, 'User');
    localStorage.setItem(this.isImpersonatingKey, 'true');

    const userId =
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

    if (userId) {
      localStorage.setItem(this.userIdKey, userId.toString());
    }
  }

  backToAdmin(): void {
    const adminToken = localStorage.getItem(this.adminTokenKey);

    if (!adminToken || this.isTokenExpired(adminToken)) {
      this.logout();
      return;
    }

    localStorage.setItem(this.tokenKey, adminToken);
    localStorage.removeItem(this.adminTokenKey);
    localStorage.removeItem(this.isImpersonatingKey);

    const payload = this.decodeToken(adminToken);

    localStorage.setItem(this.roleKey, 'Admin');

    if (payload) {
      const userName =
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ?? 'admin';

      const userId =
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

      localStorage.setItem(this.userNameKey, userName);

      if (userId) {
        localStorage.setItem(this.userIdKey, userId.toString());
      }
    } else {
      localStorage.setItem(this.userNameKey, 'admin');
      localStorage.setItem(this.userIdKey, '0');
    }
  }

  getUserId(): number | null {
    const id = localStorage.getItem(this.userIdKey);
    return id ? parseInt(id, 10) : null;
  }

  getUserName(): string {
    return localStorage.getItem(this.userNameKey) ?? '';
  }

  getRole(): string {
    return localStorage.getItem(this.roleKey) ?? '';
  }

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }

  isImpersonating(): boolean {
    return localStorage.getItem(this.isImpersonatingKey) === 'true';
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }

    return true;
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.adminTokenKey);
    localStorage.removeItem(this.userNameKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem(this.isImpersonatingKey);
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);

    if (!payload?.exp) {
      return true;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);

    return payload.exp <= nowInSeconds;
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];

      if (!payload) {
        return null;
      }

      const base64 = payload
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const paddedBase64 = base64.padEnd(
        base64.length + (4 - (base64.length % 4)) % 4,
        '='
      );

      const binary = atob(paddedBase64);
      const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
      const json = new TextDecoder('utf-8').decode(bytes);

      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}