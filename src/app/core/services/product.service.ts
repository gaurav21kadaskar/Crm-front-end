import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createProduct(productData: any): Observable<any> {
    const formData = this.toFormData(productData);
    return this.http.post<any>(`${this.apiUrl}/api/product/`, formData);
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/api/product/`);
  }

  updateProduct(id: number, productData: any): Observable<any> {
    const formData = this.toFormData(productData);
    return this.http.patch<any>(`${this.apiUrl}/api/product/${id}/`, formData);
  }

  private toFormData(data: any): FormData {
    const formData = new FormData();
    for (const key of Object.keys(data)) {
      if (data[key] !== null && data[key] !== undefined) {
        // Only append file if it is a File object, else stringify/append other fields
        if (data[key] instanceof File) {
          formData.append(key, data[key], data[key].name);
        } else {
          formData.append(key, data[key]);
        }
      }
    }
    return formData;
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/product/${id}/`);
  }
}
