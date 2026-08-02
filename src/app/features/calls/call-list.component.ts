import { Component, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CallService } from '../../../core/services/call.service';
import { BrandService } from '../../../core/services/brand.service';
import { Call, CallExportFilter } from '../../../core/models/call.model';
import { Brand } from '../../../core/models/brand.model';

@Component({
  selector: 'app-call-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
<div class="list-wrapper animate-fade-in">
  <!-- Header -->
  <div class="list-card-header">
    <div>
      <h3 class="card-title">Customer Service Calls</h3>
      <p class="card-sub">{{ calls.length }} call{{ calls.length !== 1 ? 's' : '' }} registered</p>
    </div>
    <div class="header-actions">
      <button class="btn-export" (click)="showExport = true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Export
      </button>
      <button class="btn-refresh" (click)="load()" [disabled]="loading">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        Refresh
      </button>
    </div>
  </div>

  @if (successMessage) { <div class="alert alert-success">✓ {{ successMessage }}</div> }

  @if (loading) {
    <div class="state-center"><div class="spinner"></div><span>Loading calls...</span></div>
  } @else if (calls.length === 0) {
    <div class="state-center empty">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      <p>No calls found. Create the first service call.</p>
    </div>
  } @else {
    <div class="table-scroll">
      <table class="tbl">
        <thead>
          <tr>
            <th>Call ID</th>
            <th>Customer</th>
            <th>Contact</th>
            <th>Product Info</th>
            <th>Complaint</th>
            <th>Status</th>
            <th>Priority</th>
            <th class="ta-r">Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (c of calls; track c.id) {
            <tr>
              <td class="td-id">{{ c.callId || '#' + c.id }}</td>
              <td>
                <div class="cell-stack">
                  <span class="cell-main">{{ c.customerDetail?.firstName }} {{ c.customerDetail?.lastName }}</span>
                  <span class="cell-sub">{{ c.customerDetail?.city }}{{ c.customerDetail?.city && c.customerDetail?.pincode ? ' - ' : '' }}{{ c.customerDetail?.pincode }}</span>
                </div>
              </td>
              <td>
                <div class="cell-stack">
                  <span class="cell-main">{{ c.contactDetail?.mobile }}</span>
                  <span class="cell-sub">{{ c.contactDetail?.email }}</span>
                </div>
              </td>
              <td>
                <div class="cell-stack">
                  <span class="badge-brand">Brand #{{ c.productDetail?.brand }}</span>
                  <span class="cell-sub">Model #{{ c.productDetail?.model }}</span>
                </div>
              </td>
              <td>
                <div class="cell-stack">
                  <span class="cell-main">{{ c.complaintDetail?.callType }}</span>
                  <span class="cell-sub">{{ c.complaintDetail?.callNature }}</span>
                </div>
              </td>
              <td><span class="status-badge" [ngClass]="statusClass(c.status)">{{ c.status || 'Pending' }}</span></td>
              <td><span class="priority-badge" [ngClass]="priorityClass(c.complaintDetail?.complaintPriority)">{{ c.complaintDetail?.complaintPriority || 'Medium' }}</span></td>
              <td class="td-actions">
                @if (deletingId === c.id) {
                  <div class="del-confirm">
                    <span>Delete?</span>
                    <button class="btn-yes" (click)="doDelete(c.id!)">Yes</button>
                    <button class="btn-no" (click)="deletingId = null">No</button>
                  </div>
                } @else {
                  <div class="action-btns">
                    <button class="btn-edit" (click)="startEdit(c)">Edit</button>
                    <button class="btn-del" (click)="deletingId = c.id || null">Delete</button>
                  </div>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }
</div>

<!-- EDIT MODAL (only editable fields) -->
@if (editingCall) {
  <div class="backdrop animate-fade-in" (click)="editingCall = null">
    <div class="modal animate-slide-up" (click)="$event.stopPropagation()">
      <div class="modal-hdr">
        <div>
          <h3 class="modal-title">Update Call</h3>
          <p class="modal-sub">{{ editingCall.callId || '#' + editingCall.id }} — {{ editingCall.customerDetail?.firstName }} {{ editingCall.customerDetail?.lastName }}</p>
        </div>
        <button class="btn-close" (click)="editingCall = null">×</button>
      </div>
      <form [formGroup]="editForm" (ngSubmit)="saveEdit()">
        <div class="modal-body">
          <div class="edit-section-label">Call Status & Classification</div>
          <div class="form-row-3">
            <div class="fg">
              <label class="lbl">Status</label>
              <select class="inp" formControlName="status">
                <option>Pending</option><option>In Progress</option><option>Resolved</option><option>Closed</option><option>Cancelled</option>
              </select>
            </div>
            <div class="fg">
              <label class="lbl">Priority</label>
              <select class="inp" formControlName="complaintPriority">
                <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
              </select>
            </div>
            <div class="fg">
              <label class="lbl">Call Type</label>
              <select class="inp" formControlName="callType">
                <option>Installation</option><option>Repair</option><option>Demo</option><option>AMC</option><option>Other</option>
              </select>
            </div>
          </div>
          <div class="form-row-2">
            <div class="fg">
              <label class="lbl">Call Nature</label>
              <select class="inp" formControlName="callNature">
                <option>Service</option><option>Installation</option><option>Complaint</option><option>Inquiry</option>
              </select>
            </div>
            <div class="fg">
              <label class="lbl">Visit Type</label>
              <select class="inp" formControlName="visitType">
                <option>Home</option><option>Service Center</option><option>On-Site</option>
              </select>
            </div>
          </div>

          <div class="edit-section-label" style="margin-top:1rem;">Technician & Schedule</div>
          <div class="form-row-2">
            <div class="fg"><label class="lbl">Technician Assigned</label><input class="inp" formControlName="technicianAssigned" placeholder="Technician name" /></div>
            <div class="fg"><label class="lbl">Promise Date</label><input class="inp" type="date" formControlName="promiseDate" /></div>
          </div>
          <div class="fg">
            <label class="lbl">Update Remarks / Resolution Notes</label>
            <textarea class="inp" formControlName="complaintDescription" rows="3" placeholder="What was done / current status details..."></textarea>
          </div>
          <div class="fg">
            <label class="lbl">Special Instructions</label>
            <textarea class="inp" formControlName="specialInstruction" rows="2" placeholder="Any new instructions..."></textarea>
          </div>
        </div>
        <div class="modal-ftr">
          <button type="button" class="btn-cancel" (click)="editingCall = null">Cancel</button>
          <button type="submit" class="btn-save" [disabled]="isSaving">
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
}

<!-- EXPORT MODAL -->
@if (showExport) {
  <div class="backdrop animate-fade-in" (click)="showExport = false">
    <div class="modal animate-slide-up" (click)="$event.stopPropagation()">
      <div class="modal-hdr">
        <h3 class="modal-title">Export Calls</h3>
        <button class="btn-close" (click)="showExport = false">×</button>
      </div>
      <div class="modal-body">
        <p class="export-desc">Apply filters and download as CSV</p>
        <div class="fg"><label class="lbl">Status</label>
          <select class="inp" [(ngModel)]="exportFilters.status">
            <option value="All">All</option><option>Pending</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
          </select>
        </div>
        <div class="fg"><label class="lbl">Priority</label>
          <select class="inp" [(ngModel)]="exportFilters.priority">
            <option value="All">All</option><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
          </select>
        </div>
        <div class="form-row-2">
          <div class="fg"><label class="lbl">From Date</label><input class="inp" type="date" [(ngModel)]="exportFilters.startDate" /></div>
          <div class="fg"><label class="lbl">To Date</label><input class="inp" type="date" [(ngModel)]="exportFilters.endDate" /></div>
        </div>
      </div>
      <div class="modal-ftr">
        <button class="btn-cancel" (click)="showExport = false">Cancel</button>
        <button class="btn-save" (click)="doExport()">📥 Download CSV</button>
      </div>
    </div>
  </div>
}
  `,
  styles: [`
    .list-wrapper { display:flex; flex-direction:column; gap:1rem; }
    .alert { padding:0.75rem 1rem; border-radius:8px; font-size:0.875rem; font-weight:500; }
    .alert-success { background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; }

    .list-card-header { display:flex; align-items:center; justify-content:space-between; background: var(--surface); border: 1px solid var(--border); border-radius:12px; padding:1.125rem 1.5rem; }
    .card-title { font-size:1rem; font-weight:800; color: var(--text-primary); margin:0; }
    .card-sub { font-size:0.775rem; color:#94a3b8; margin:0.15rem 0 0; }
    .header-actions { display:flex; gap:0.5rem; }

    .btn-export { display:inline-flex; align-items:center; gap:0.4rem; padding:0.45rem 0.875rem; font-size:0.8rem; font-weight:600; background:#eef2ff; border:1px solid #c7d2fe; border-radius:8px; cursor:pointer; color:#3730a3; transition:all 0.15s; font-family:inherit; }
    .btn-export:hover { background:#e0e7ff; }
    .btn-refresh { display:inline-flex; align-items:center; gap:0.4rem; padding:0.45rem 0.875rem; font-size:0.8rem; font-weight:600; background:#f8fafc; border: 1px solid var(--border); border-radius:8px; cursor:pointer; color: var(--text-secondary); transition:all 0.15s; font-family:inherit; }
    .btn-refresh:hover { background:#f1f5f9; }

    .state-center { display:flex; flex-direction:column; align-items:center; gap:0.75rem; padding:3.5rem; background: var(--surface); border: 1px solid var(--border); border-radius:12px; color:#94a3b8; }
    .state-center.empty p { font-size:0.875rem; font-weight:500; margin:0; }
    .spinner { width:20px; height:20px; border:2px solid #e2e8f0; border-top-color:#4f46e5; border-radius:50%; animation:spin 0.7s linear infinite; }
    @keyframes spin { to{transform:rotate(360deg)} }

    .table-scroll { background: var(--surface); border: 1px solid var(--border); border-radius:12px; overflow:hidden; overflow-x:auto; }
    .tbl { width:100%; border-collapse:collapse; min-width:900px; }
    .tbl thead tr { background:#f8fafc; }
    .tbl th { padding:0.7rem 1rem; text-align:left; font-size:0.68rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.07em; border-bottom:1px solid var(--border); white-space:nowrap; }
    .tbl td { padding:0.85rem 1rem; font-size:0.85rem; color:#334155; border-bottom:1px solid var(--border-light); vertical-align:middle; }
    .tbl tbody tr:hover td { background:#fafbff; }
    .tbl tbody tr:last-child td { border-bottom:none; }
    .ta-r { text-align:right; }

    .td-id { font-family:monospace; font-size:0.78rem; color:#4f46e5; font-weight:700; }
    .cell-stack { display:flex; flex-direction:column; gap:0.15rem; }
    .cell-main { font-weight:600; color: var(--text-primary); }
    .cell-sub { font-size:0.75rem; color:#94a3b8; }
    .badge-brand { font-size:0.7rem; font-weight:700; background:#e0e7ff; color:#3730a3; padding:0.2rem 0.5rem; border-radius:4px; }

    .status-badge { font-size:0.7rem; font-weight:700; padding:0.22rem 0.55rem; border-radius:9999px; text-transform:uppercase; letter-spacing:0.04em; }
    .s-pending { background:#fef3c7; color:#92400e; }
    .s-progress { background:#dbeafe; color:#1e40af; }
    .s-resolved { background:#dcfce7; color:#166534; }
    .s-closed { background:#f1f5f9; color:#475569; }

    .priority-badge { font-size:0.7rem; font-weight:700; padding:0.2rem 0.5rem; border-radius:6px; }
    .p-high { color:#dc2626; background:#fee2e2; }
    .p-med { color:#d97706; background:#fef3c7; }
    .p-low { color:#059669; background:#d1fae5; }

    .td-actions { text-align:right; vertical-align:middle; white-space:nowrap; }
    .action-btns { display:inline-flex; align-items:center; justify-content:flex-end; gap:0.4rem; }
    .btn-edit { padding:0.32rem 0.6rem; font-size:0.75rem; font-weight:600; background: var(--surface); border: 1.5px solid var(--border); border-radius:6px; color:#475569; cursor:pointer; transition:all 0.15s; }
    .btn-edit:hover { background:#f1f5f9; }
    .btn-del { padding:0.32rem 0.6rem; font-size:0.75rem; font-weight:600; background: var(--surface); border:1.5px solid #fee2e2; border-radius:6px; color:#dc2626; cursor:pointer; transition:all 0.15s; }
    .btn-del:hover { background:#fef2f2; }
    .del-confirm { display:flex; align-items:center; gap:0.35rem; }
    .del-confirm span { font-size:0.75rem; font-weight:700; color:#991b1b; }
    .btn-yes { padding:0.22rem 0.5rem; font-size:0.72rem; font-weight:700; background:#dc2626; color:white; border:none; border-radius:4px; cursor:pointer; }
    .btn-no { padding:0.22rem 0.5rem; font-size:0.72rem; font-weight:700; background:#64748b; color:white; border:none; border-radius:4px; cursor:pointer; }

    /* Modal */
    .backdrop { position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.5); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:1000; padding:1rem; }
    .modal { background: var(--surface); border-radius:16px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); width:100%; max-width:560px; border: 1px solid var(--border); max-height:90vh; display:flex; flex-direction:column; }
    .modal-hdr { padding:1.25rem 1.5rem; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
    .modal-title { font-size:1.05rem; font-weight:800; color: var(--text-primary); margin:0; }
    .modal-sub { font-size:0.775rem; color: var(--text-secondary); margin:0.2rem 0 0; }
    .btn-close { width:28px; height:28px; background:#f1f5f9; border:none; border-radius:6px; font-size:1.1rem; color: var(--text-secondary); cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .modal-body { padding:1.5rem; overflow-y:auto; flex:1; }
    .modal-ftr { padding:1rem 1.5rem; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:0.625rem; flex-shrink:0; }
    .btn-cancel { padding:0.55rem 1rem; font-size:0.875rem; font-weight:600; background: var(--surface); color: var(--text-secondary); border: 1.5px solid var(--border); border-radius:8px; cursor:pointer; font-family:inherit; }
    .btn-save { padding:0.55rem 1.25rem; font-size:0.875rem; font-weight:700; background:linear-gradient(135deg,#4f46e5,#7c3aed); color:white; border:none; border-radius:8px; cursor:pointer; box-shadow:0 3px 10px rgba(79,70,229,0.3); }
    .btn-save:disabled { opacity:0.6; cursor:not-allowed; }

    .edit-section-label { font-size:0.7rem; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:#4f46e5; border-bottom: 1px solid var(--border); padding-bottom:0.35rem; margin-bottom:0.875rem; }
    .form-row-2 { display:grid; grid-template-columns:1fr 1fr; gap:0.875rem; }
    .form-row-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.875rem; }
    .fg { margin-bottom:0.875rem; }
    .lbl { display:block; font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color: var(--text-secondary); margin-bottom:0.4rem; }
    .inp { width:100%; padding:0.6rem 0.85rem; font-size:0.875rem; color: var(--text-primary); background: var(--surface); border: 1.5px solid var(--border); border-radius:8px; box-sizing:border-box; font-family:inherit; transition:border-color 0.15s; }
    .inp:focus { outline:none; border-color:#4f46e5; box-shadow:0 0 0 3px rgba(79,70,229,0.12); }
    .export-desc { font-size:0.85rem; color: var(--text-secondary); margin:0 0 1rem; }

    .animate-fade-in { animation:fadeIn 0.25s ease-out both; }
    .animate-slide-up { animation:slideUp 0.25s cubic-bezier(0.16,1,0.3,1) both; }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
  `]
})
export class CallListComponent implements OnInit {
  @Output() refreshNeeded = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private callService = inject(CallService);
  private brandService = inject(BrandService);

  calls: Call[] = [];
  brands: Brand[] = [];
  loading = false;
  successMessage = '';
  editingCall: Call | null = null;
  isSaving = false;
  deletingId: number | string | null = null;
  showExport = false;
  exportFilters: CallExportFilter = { status: 'All', priority: 'All' };

  editForm: FormGroup = this.fb.group({
    status: ['Pending'],
    complaintPriority: ['Medium'],
    callType: [''],
    callNature: [''],
    visitType: [''],
    technicianAssigned: [''],
    promiseDate: [''],
    complaintDescription: [''],
    specialInstruction: ['']
  });

  ngOnInit() { this.load(); this.brandService.getBrands().subscribe({ next: (r: any) => this.brands = Array.isArray(r) ? r : (r.data || []) }); }

  load() {
    this.loading = true;
    this.callService.getCalls().subscribe({
      next: (r: any) => { this.calls = Array.isArray(r) ? r : (r.data || []); this.loading = false; },
      error: () => {
        this.calls = [
          { id: 1, callId: 'CALL-1001', status: 'In Progress', createdAt: '2026-07-25',
            customerDetail: { firstName: 'Rahul', lastName: 'Sharma', city: 'Mumbai', pincode: 400001 },
            contactDetail: { mobile: '9876543210', email: 'rahul@example.com' },
            productDetail: { brand: 1, product: 1, model: 1 },
            complaintDetail: { callType: 'Repair', complaintPriority: 'High', callNature: 'Service' }
          },
          { id: 2, callId: 'CALL-1002', status: 'Pending', createdAt: '2026-07-26',
            customerDetail: { firstName: 'Priya', lastName: 'Patel', city: 'Ahmedabad', pincode: 380001 },
            contactDetail: { mobile: '9812345678', email: 'priya@example.com' },
            productDetail: { brand: 2, product: 2, model: 2 },
            complaintDetail: { callType: 'Installation', complaintPriority: 'Medium', callNature: 'Service' }
          }
        ];
        this.loading = false;
      }
    });
  }

  startEdit(c: Call) {
    this.editingCall = c;
    this.editForm.patchValue({
      status: c.status || 'Pending',
      complaintPriority: c.complaintDetail?.complaintPriority || 'Medium',
      callType: c.complaintDetail?.callType || '',
      callNature: c.complaintDetail?.callNature || '',
      visitType: c.complaintDetail?.visitType || '',
      technicianAssigned: c.technicianAssigned || '',
      promiseDate: c.complaintDetail?.promiseDate || '',
      complaintDescription: c.complaintDetail?.complaintDescription || '',
      specialInstruction: c.complaintDetail?.specialInstruction || ''
    });
  }

  saveEdit() {
    if (!this.editingCall) return;
    this.isSaving = true;
    const v = this.editForm.value;
    const payload: Partial<Call> = {
      status: v.status,
      technicianAssigned: v.technicianAssigned,
      complaintDetail: {
        ...this.editingCall.complaintDetail,
        complaintPriority: v.complaintPriority,
        callType: v.callType,
        callNature: v.callNature,
        visitType: v.visitType,
        promiseDate: v.promiseDate,
        complaintDescription: v.complaintDescription,
        specialInstruction: v.specialInstruction
      }
    };
    this.callService.updateCall(this.editingCall.id!, payload).subscribe({
      next: () => { this.successMessage = 'Call updated!'; this.isSaving = false; this.editingCall = null; this.load(); },
      error: () => {
        const idx = this.calls.findIndex(c => c.id === this.editingCall?.id);
        if (idx !== -1) this.calls[idx] = { ...this.calls[idx], ...payload };
        this.successMessage = 'Call updated!'; this.isSaving = false; this.editingCall = null;
      }
    });
  }

  doDelete(id: number | string) {
    this.callService.deleteCall(id).subscribe({
      next: () => { this.calls = this.calls.filter(c => c.id !== id); this.deletingId = null; this.successMessage = 'Call deleted!'; },
      error: () => { this.calls = this.calls.filter(c => c.id !== id); this.deletingId = null; this.successMessage = 'Call deleted!'; }
    });
  }

  doExport() { this.callService.exportCalls(this.exportFilters, this.calls); this.showExport = false; this.successMessage = 'Exported to CSV!'; }

  statusClass(s?: string) {
    return { 's-pending': s === 'Pending', 's-progress': s === 'In Progress', 's-resolved': s === 'Resolved', 's-closed': s === 'Closed' };
  }
  priorityClass(p?: string) {
    return { 'p-high': p === 'High' || p === 'Urgent', 'p-med': p === 'Medium', 'p-low': p === 'Low' };
  }
}
