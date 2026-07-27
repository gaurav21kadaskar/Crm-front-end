import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Brand } from '../models/brand.model';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createBrand(brandData: Brand): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/brand/`, brandData);
  }
  
  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.apiUrl}/api/brand/`);
  }

  updateBrand(id: number, brandData: Partial<Brand>): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/api/brand/${id}/`, brandData);
  }

  deleteBrand(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/brand/${id}/`);
  }
}
