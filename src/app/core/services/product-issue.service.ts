import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductIssue } from '../models/product-issue.model';

@Injectable({
  providedIn: 'root'
})
export class ProductIssueService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createProductIssue(issueData: ProductIssue): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/productissue/`, issueData);
  }

  getProductIssues(): Observable<ProductIssue[]> {
    return this.http.get<ProductIssue[]>(`${this.apiUrl}/api/productissue/`);
  }

  updateProductIssue(id: number, issueData: Partial<ProductIssue>): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/api/productissue/${id}/`, issueData);
  }

  deleteProductIssue(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/productissue/${id}/`);
  }
}
