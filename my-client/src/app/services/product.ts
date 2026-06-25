import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

 private authHeaders(): HttpHeaders {
  const token = localStorage.getItem('token');
  return new HttpHeaders({ Authorization: `Bearer ${token}` });

}

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products`);
  }

 getFavorites(): Observable<number[]> {
  const token = localStorage.getItem('token');
  return this.http.get<number[]>(`${this.apiUrl}/favorites`, 
    { headers: { Authorization: `Bearer ${token}` } });
}

addFavorite(productId: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/favorites/${productId}`, {},
    { headers: this.authHeaders() });
}

removeFavorite(productId: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/favorites/${productId}`,
    { headers: this.authHeaders() });
}

  getUsers(): Observable<any[]> {
  const token = localStorage.getItem('token');
  return this.http.get<any[]>(
    `${this.apiUrl}/users`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

  loginAs(userId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/admin/login-as/${userId}`,
      {},
      { headers: this.authHeaders() }
    );
  }
}
