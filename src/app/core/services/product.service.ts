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

  private base64ToFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  private preparePayload(data: any): any {
    if (!data || typeof data !== 'object') return data;

    let fileObj: File | null = null;
    const candidateKeys = ['productImage', 'product_image', 'image', 'imageUrl'];
    for (const key of candidateKeys) {
      const val = data[key];
      if (val instanceof File) {
        fileObj = val;
        break;
      } else if (typeof val === 'string' && val.startsWith('data:image/')) {
        fileObj = this.base64ToFile(val, 'product_image.jpg');
        break;
      } else if (typeof val === 'string') {
        // It's an existing image URL/path/marker — strip it so backend ignores it (partial=True)
        delete data[key];
      }
    }

    if (fileObj) {
      const formData = new FormData();
      formData.append('productImage', fileObj, fileObj.name || 'product_image.jpg');

      for (const key of Object.keys(data)) {
        if (candidateKeys.includes(key)) continue;
        const val = data[key];
        if (val === null || val === undefined) continue;
        if (typeof val === 'object') {
          formData.append(key, JSON.stringify(val));
        } else {
          formData.append(key, String(val));
        }
      }
      return formData;
    }
    return data;
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/product/${id}/`);
  }
}
