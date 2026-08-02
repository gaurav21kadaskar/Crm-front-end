import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Call, CallExportFilter } from '../models/call.model';

@Injectable({ providedIn: 'root' })
export class CallService {
  private readonly apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getCalls(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/call/`);
  }

  getCallById(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/call/${id}/`);
  }

  createCall(callData: Call): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/call/`, callData);
  }

  updateCall(id: number | string, callData: Partial<Call>): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/api/call/${id}/`, callData);
  }

  deleteCall(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/call/${id}/`);
  }

  exportCalls(filters: CallExportFilter, calls: Call[]): void {
    const params: any = {};
    if (filters.status && filters.status !== 'All') {
      params.callStatus = filters.status;
    }
    if (filters.startDate) {
      params.startDate = filters.startDate;
    }
    if (filters.endDate) {
      params.endDate = filters.endDate;
    }

    this.http.get(`${this.apiUrl}/api/ExportCallReport/`, {
      params,
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CallReport_${new Date().toISOString().slice(0,10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.warn('Backend export API failed, falling back to client-side CSV export', err);
        this.fallbackClientExport(filters, calls);
      }
    });
  }

  private fallbackClientExport(filters: CallExportFilter, calls: Call[]): void {
    let filtered = [...calls];
    if (filters.status && filters.status !== 'All') filtered = filtered.filter(c => c.status === filters.status);
    if (filters.priority && filters.priority !== 'All') filtered = filtered.filter(c => c.complaintDetail?.complaintPriority === filters.priority);
    if (filters.startDate && filters.startDate !== '') filtered = filtered.filter(c => c.createdAt && c.createdAt >= filters.startDate!);
    if (filters.endDate && filters.endDate !== '') filtered = filtered.filter(c => c.createdAt && c.createdAt <= filters.endDate!);

    const headers = ['Call ID','Customer','Mobile','City','Brand','Product','Model','Call Type','Priority','Status','Created'];
    const rows = filtered.map(c => [
      c.callId || c.id,
      `"${c.customerDetail?.firstName} ${c.customerDetail?.lastName || ''}"`,
      `"${c.contactDetail?.mobile || ''}"`,
      `"${c.customerDetail?.city || ''}"`,
      c.productDetail?.brand || '',
      c.productDetail?.product || '',
      c.productDetail?.model || '',
      `"${c.complaintDetail?.callType || ''}"`,
      `"${c.complaintDetail?.complaintPriority || ''}"`,
      `"${c.status || ''}"`,
      `"${c.createdAt || ''}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Calls_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }
}
