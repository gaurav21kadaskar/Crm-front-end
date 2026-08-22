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

  createProductPart(partData: any): Observable<any> {
    const payload = this.preparePayload(partData);
    return this.http.post<any>(`${this.apiUrl}/api/productpart/`, payload);
  }

  getProductParts(productId?: number | string): Observable<any> {
    const params: any = {};
    if (productId) params.productId = productId;
    return this.http.get<any>(`${this.apiUrl}/api/productpart/`, { params });
  }

  updateProductPart(id: number, partData: any): Observable<any> {
    const payload = this.preparePayload(partData);
    return this.http.patch<any>(`${this.apiUrl}/api/productpart/${id}/`, payload);
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
    if (!data) return data;
    if (data instanceof FormData) return data;
    if (typeof data !== 'object') return data;

    let fileObj: File | null = null;
    const candidateKeys = ['partImage', 'part_image', 'image', 'imageUrl'];
    for (const key of candidateKeys) {
      const val = data[key];
      if (val instanceof File) {
        fileObj = val;
        break;
      } else if (typeof val === 'string' && val.startsWith('data:image/')) {
        fileObj = this.base64ToFile(val, 'part_image.jpg');
        break;
      }
    }

    if (fileObj) {
      const formData = new FormData();
      formData.append('partImage', fileObj, fileObj.name || 'part_image.jpg');

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

  deleteProductPart(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/productpart/${id}/`);
  }
}
