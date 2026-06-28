import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { Product } from '../models/product';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

 private authHeaders(): HttpHeaders {
  const token = localStorage.getItem('token');
   if (!token) {
    return new HttpHeaders();
  }
  return new HttpHeaders({ Authorization: `Bearer ${token}` });

}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`,
     { headers:this.authHeaders() } 
    );
  }

 getFavorites(): Observable<number[]> {
  return this.http.get<number[]>(`${this.apiUrl}/favorites`, 
    { headers: this.authHeaders()});
}

addFavorite(productId: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/favorites/${productId}`, {},
    { headers: this.authHeaders() });
}

removeFavorite(productId: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/favorites/${productId}`,
    { headers: this.authHeaders() });
}

  getUsers(): Observable<User[]> {
  return this.http.get<User[]>(
    `${this.apiUrl}/users`,
    { headers:this.authHeaders() }
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
