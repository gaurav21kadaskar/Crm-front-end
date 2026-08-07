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
    const payload = this.preparePayload(productData);
    return this.http.post<any>(`${this.apiUrl}/api/product/`, payload);
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/api/product/`);
  }

  updateProduct(id: number, productData: any): Observable<any> {
    const payload = this.preparePayload(productData);
    return this.http.patch<any>(`${this.apiUrl}/api/product/${id}/`, payload);
  }

  private preparePayload(data: any): any {
    let hasFile = false;
    for (const key of Object.keys(data)) {
      if (data[key] instanceof File) {
        hasFile = true;
        break;
      }
    }

    const keyMap: { [key: string]: string } = {
      productCode: 'product_code',
      productImage: 'product_image',
      isActive: 'is_active'
    };

    if (hasFile) {
      const formData = new FormData();
      for (const key of Object.keys(data)) {
        const value = data[key];
        if (value === null || value === undefined || value === 'null') continue;
        
        // Append original camelCase key
        if (value instanceof File) {
          formData.append(key, value, value.name);
        } else {
          formData.append(key, value);
        }

        // Append mapped snake_case key
        const apiKey = keyMap[key];
        if (apiKey && apiKey !== key) {
          if (value instanceof File) {
            formData.append(apiKey, value, value.name);
          } else {
            formData.append(apiKey, value);
          }
        }
      }
      return formData;
    } else {
      const mappedData: any = {};
      for (const key of Object.keys(data)) {
        const value = data[key];
        if (value === null || value === undefined || value === 'null') continue;
        
        // Set original camelCase key
        mappedData[key] = value;
        
        // Set mapped snake_case key
        const apiKey = keyMap[key];
        if (apiKey && apiKey !== key) {
          mappedData[apiKey] = value;
        }
      }
      return mappedData;
    }
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/product/${id}/`);
  }
}
