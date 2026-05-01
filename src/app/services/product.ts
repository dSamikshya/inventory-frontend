import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'http://localhost:8080/api/products';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllProducts(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&size=${size}`, {
      headers: this.getHeaders()
    });
  }

  createProduct(product: any): Observable<any> {
    return this.http.post(this.apiUrl, product, {
      headers: this.getHeaders()
    });
  }

  updateProduct(id: number, product: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, product, {
      headers: this.getHeaders()
    });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  getLowStockProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/low-stock`, {
      headers: this.getHeaders()
    });
  }

  searchProducts(searchTerm: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search?searchTerm=${searchTerm}`, {
      headers: this.getHeaders()
    });
  }
  importFromExcel(file: File): Observable<any> {
  const token = this.authService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  
  
  const formData = new FormData();
  formData.append('file', file);
  
  return this.http.post(
    'http://localhost:8080/api/products/batches/import/excel',
    formData,
    { headers }
  );
}
getCategoryList(): Observable<any> {
  return this.http.get('http://localhost:8080/api/categories/list', {
    headers: this.getHeaders()
  });
}

receiveBatch(batch: any): Observable<any> {
  return this.http.post(
    'http://localhost:8080/api/products/batches',
    batch,
    { headers: this.getHeaders() }
  );
}

importFromCSV(file: File): Observable<any> {
  const token = this.authService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post(
    'http://localhost:8080/api/products/batches/import/csv',
    formData,
    { headers }
  );
}
}