import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductPart } from '../models/product-part.model';

@Injectable({
  providedIn: 'root'
})
export class ProductPartService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createProductPart(partData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/productpart/`, partData);
  }

  getProductParts(): Observable<ProductPart[]> {
    return this.http.get<ProductPart[]>(`${this.apiUrl}/api/productpart/`);
  }

  updateProductPart(id: number, partData: FormData): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/api/productpart/${id}/`, partData);
  }

  deleteProductPart(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/productpart/${id}/`);
  }
}
