import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductModel } from '../models/product-model.model';

@Injectable({
  providedIn: 'root'
})
export class ProductModelService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createProductModel(modelData: ProductModel): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/productmodel/`, modelData);
  }

  getProductModels(): Observable<ProductModel[]> {
    return this.http.get<ProductModel[]>(`${this.apiUrl}/api/productmodel/`);
  }

  updateProductModel(id: number, modelData: Partial<ProductModel>): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/api/productmodel/${id}/`, modelData);
  }

  deleteProductModel(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/productmodel/${id}/`);
  }
}
