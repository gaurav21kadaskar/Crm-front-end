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

  getCallByNumber(callNumber: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/call/`, { params: { callNumber } });
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

  /** Converts UI Title Case status to backend UPPER_SNAKE_CASE */
  private toBackendStatus(status: string): string {
    const map: { [key: string]: string } = {
      'Open':        'OPEN',
      'In Progress': 'IN_PROGRESS',
      'Completed':   'COMPLETED',
      'Cancelled':   'CANCELLED',
      'Closed':      'CLOSED',
    };
    return map[status] || status.toUpperCase().replace(/\s+/g, '_');
  }

  exportCalls(filters: CallExportFilter, calls: Call[]): void {
    const params: any = {};

    // Send status in UPPER_SNAKE_CASE as the backend requires
    if (filters.status && filters.status !== 'All') {
      const backendStatus = this.toBackendStatus(filters.status);
      params.status      = backendStatus;
      params.call_status = backendStatus;
      params.callStatus  = backendStatus;
    }
    if (filters.startDate) {
      params.startDate  = filters.startDate;
      params.start_date = filters.startDate;
    }
    if (filters.endDate) {
      params.endDate  = filters.endDate;
      params.end_date = filters.endDate;
    }

    this.http.get(`${this.apiUrl}/api/ExportCallReport/`, {
      params,
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        if (blob.size < 100) {
          console.warn('Backend export returned empty blob — falling back to client-side CSV');
          this.clientSideExport(filters, calls);
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.setAttribute('href', url);
          a.setAttribute('download', `CallReport_${new Date().toISOString().slice(0, 10)}.xlsx`);
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
        }
      },
      error: (err) => {
        console.warn('Backend export failed — falling back to client-side CSV', err);
        this.clientSideExport(filters, calls);
      }
    });
  }

  private clientSideExport(filters: CallExportFilter, calls: Call[]): void {
    let filtered = [...calls];

    // Status filter — normalize both sides so "Completed" matches "COMPLETED" / "Resolved" etc.
    if (filters.status && filters.status !== 'All') {
      const target = this.toBackendStatus(filters.status); // e.g. "COMPLETED"
      filtered = filtered.filter(c => {
        const s = (c.status || '').toUpperCase().trim().replace(/[\s-]+/g, '_');
        if (target === 'COMPLETED') return s === 'COMPLETED' || s === 'RESOLVED';
        return s === target;
      });
    }

    // Date filters — compare only YYYY-MM-DD portion
    if (filters.startDate) {
      filtered = filtered.filter(c => c.createdAt && c.createdAt.slice(0, 10) >= filters.startDate!);
    }
    if (filters.endDate) {
      filtered = filtered.filter(c => c.createdAt && c.createdAt.slice(0, 10) <= filters.endDate!);
    }

    const headers = [
      'Call ID', 'Customer', 'Mobile', 'City',
      'Brand', 'Product', 'Model', 'Call Type', 'Priority', 'Status', 'Created'
    ];
    const rows = filtered.map(c => [
      c.callId || c.id || '',
      `"${((c.customerDetail?.firstName || '') + ' ' + (c.customerDetail?.lastName || '')).trim()}"`,
      `"${c.contactDetail?.mobile || ''}"`,
      `"${c.customerDetail?.city || ''}"`,
      `"${c.productDetail?.brand || ''}"`,
      `"${c.productDetail?.product || ''}"`,
      `"${c.productDetail?.model || ''}"`,
      `"${c.complaintDetail?.callType || ''}"`,
      `"${c.complaintDetail?.complaintPriority || ''}"`,
      `"${c.status || ''}"`,
      `"${c.createdAt ? c.createdAt.slice(0, 10) : ''}"`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    // \uFEFF = UTF-8 BOM so Excel opens it with correct encoding
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Calls_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
  }
}
