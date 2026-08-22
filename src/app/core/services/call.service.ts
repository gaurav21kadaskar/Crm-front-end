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
    return this.http.get<any>(`${this.apiUrl}/api/call/?page_size=1000`);
  }

  getCallById(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/call/${id}/`);
  }

  getCallByNumber(callNumber: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/call/`, { params: { callNumber } });
  }

  createCall(callData: Call | any): Observable<any> {
    const { callImage, call_image, imageUrl, image, attachment, ...jsonPayload } = callData || {};
    return this.http.post<any>(`${this.apiUrl}/api/call/`, jsonPayload);
  }

  updateCall(id: number | string, callData: Partial<Call> | any): Observable<any> {
    const payload = this.preparePayload(callData);
    return this.http.patch<any>(`${this.apiUrl}/api/call/${id}/`, payload);
  }

  updateCallFieldOnly(callNumber: string, data: any): Observable<any> {
    const payload = this.preparePayload(data);
    return this.http.patch<any>(`${this.apiUrl}/api/UpdateCallFieldOnly/${callNumber}/`, payload);
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
    const candidateKeys = ['callImage', 'call_image', 'attachment', 'imageUrl', 'image'];
    for (const key of candidateKeys) {
      const val = data[key];
      if (val instanceof File) {
        fileObj = val;
        break;
      } else if (typeof val === 'string' && val.startsWith('data:image/')) {
        fileObj = this.base64ToFile(val, 'call_image.jpg');
        break;
      }
    }

    if (fileObj) {
      const formData = new FormData();
      formData.append('callImage', fileObj, fileObj.name || 'call_image.jpg');

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

  deleteCall(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/call/${id}/`);
  }

  transferCall(callNumber: string, distributorId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/transfercall/`, { callNumber, distributorId });
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
    const statusFilter = filters.status && filters.status !== 'All' ? filters.status : null;

    // Try UPPER_SNAKE_CASE first (Django STATUS_CHOICES db value)
    const upperStatus = statusFilter ? this.toBackendStatus(statusFilter) : null;
    this.tryBackendExport(filters, upperStatus, (success) => {
      if (success) return;
      // Try Title Case (in case db stores display value)
      this.tryBackendExport(filters, statusFilter, (success2) => {
        if (success2) return;
        // Both failed — use client-side CSV from loaded calls
        console.warn('Backend export returned no data — using client-side CSV');
        this.clientSideExport(filters, calls);
      });
    });
  }

  private tryBackendExport(filters: CallExportFilter, callStatus: string | null, callback: (success: boolean) => void): void {
    const params: any = {};
    if (callStatus) {
      params.callStatus = callStatus;
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
        // If blob is small (< 500 bytes), it likely has only headers and no data rows
        if (blob.size < 500) {
          callback(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `CallReport_${new Date().toISOString().slice(0, 10)}.xlsx`);
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
        callback(true);
      },
      error: () => {
        callback(false);
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
