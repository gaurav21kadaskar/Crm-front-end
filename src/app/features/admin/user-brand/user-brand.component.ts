import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { BrandService } from '../../../core/services/brand.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Brand } from '../../../core/models/brand.model';

export interface UserBrandRow {
  userId: number;
  userName: string;
  userEmail: string;
  brandId: number;
  brandName: string;
  isActive: boolean;
}

@Component({
  selector: 'app-user-brand',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="user-brand-container animate-fade-in">
      <!-- Toolbar -->
      <div class="catalog-toolbar">
        <div class="toolbar-left">
          <div class="header-title-group">
            <span class="header-icon">👥🏷️</span>
            <div>
              <h3 class="catalog-title">Brand & User Associations</h3>
              <span class="count-badge">{{ filteredRows.length }} {{ filteredRows.length === 1 ? 'Association' : 'Associations' }}</span>
            </div>
          </div>
        </div>

        <div class="toolbar-right">
          <!-- Search box -->
          <div class="search-box">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              class="search-input" 
              [(ngModel)]="searchQuery" 
              placeholder="Search user or brand..." 
            />
            @if (searchQuery) {
              <button class="clear-search-btn" (click)="searchQuery = ''">&times;</button>
            }
          </div>

          <button class="refresh-btn" (click)="loadData()" [disabled]="isLoading" title="Refresh">
            <span [class.spin]="isLoading">↻</span>
          </button>

          @if (authService.getRole() === 'Admin') {
            <button class="create-toggle-btn" (click)="openAddModal()">
              <span class="plus-icon">+</span>
              <span>Associate User & Brand</span>
            </button>
          }
        </div>
      </div>

      <!-- Listing Table -->
      @if (isLoading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading user-brand associations...</p>
        </div>
      } @else if (filteredRows.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">🤝</div>
          <h4>No Associations Found</h4>
          <p>{{ searchQuery ? 'No user-brand mappings match your search.' : 'No user-brand associations created yet. Click "+ Associate User & Brand" to create one.' }}</p>
        </div>
      } @else {
        <div class="table-card">
          <table class="pro-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Brand</th>
                <th style="text-align: right;">Status</th>
              </tr>
            </thead>
            <tbody>
              @for (row of filteredRows; track row.userId + '-' + row.brandId; let idx = $index) {
                <tr>
                  <td class="row-num">{{ idx + 1 }}</td>
                  <td>
                    <div class="user-cell">
                      <div class="user-avatar">{{ getInitial(row.userName) }}</div>
                      <div class="user-info">
                        <span class="user-name">{{ row.userName }}</span>
                        @if (row.userEmail) {
                          <span class="user-email">{{ row.userEmail }}</span>
                        }
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="brand-badge">
                      <span class="brand-icon">🏷️</span>
                      <span class="brand-name">{{ row.brandName }}</span>
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <button 
                      type="button" 
                      class="toggle-switch-btn" 
                      [class.active]="row.isActive" 
                      (click)="promptStatusChange(row)"
                      [title]="'Click to toggle status to ' + (row.isActive ? 'Inactive' : 'Active')"
                    >
                      <span class="toggle-track">
                        <span class="toggle-thumb"></span>
                      </span>
                      <span class="toggle-text">{{ row.isActive ? 'Active' : 'Inactive' }}</span>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Add Association Modal -->
      @if (showAddModal) {
        <div class="modal-backdrop animate-fade-in" (click)="closeAddModal()">
          <div class="modal-content animate-slide-up" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Associate User & Brand</h3>
              <button class="modal-close" (click)="closeAddModal()">&times;</button>
            </div>
            <form [formGroup]="assocForm" (ngSubmit)="onSubmitAssoc()" class="modal-form-wrapper">
              <div class="modal-body">
                <!-- User Selection Dropdown (Only Customers) -->
                <div class="pro-form-group">
                  <label class="pro-label" for="selectCustomerUser">Select Customer User *</label>
                  <select 
                    id="selectCustomerUser" 
                    class="pro-input" 
                    formControlName="userId"
                    [ngClass]="{'pro-invalid': submitted && f['userId'].errors}"
                  >
                    <option value="" disabled selected>-- Select a Customer --</option>
                    @for (user of customerUsers; track user.id) {
                      <option [value]="user.id">{{ user.username }} {{ user.firstName ? '(' + user.firstName + ' ' + (user.lastName || '') + ')' : '' }}</option>
                    }
                  </select>
                  @if (submitted && f['userId'].errors?.['required']) {
                    <div class="pro-error">Customer user is required</div>
                  }
                  @if (customerUsers.length === 0) {
                    <div class="pro-hint warning">No customer users found in system.</div>
                  }
                </div>

                <!-- Brand Selection Dropdown -->
                <div class="pro-form-group">
                  <label class="pro-label" for="selectBrand">Select Brand *</label>
                  <select 
                    id="selectBrand" 
                    class="pro-input" 
                    formControlName="brandId"
                    [ngClass]="{'pro-invalid': submitted && f['brandId'].errors}"
                  >
                    <option value="" disabled selected>-- Select a Brand --</option>
                    @for (b of availableBrands; track b.id) {
                      <option [value]="b.id">{{ b.name }} (ID #{{ b.id }})</option>
                    }
                  </select>
                  @if (submitted && f['brandId'].errors?.['required']) {
                    <div class="pro-error">Brand selection is required</div>
                  }
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn-cancel" (click)="closeAddModal()">Cancel</button>
                <button type="submit" class="btn-save" [disabled]="isSubmitting">
                  {{ isSubmitting ? 'Associating...' : 'Associate Brand' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Confirmation Popup for Status Change -->
      @if (pendingRowChange) {
        <div class="modal-backdrop animate-fade-in" (click)="cancelStatusChange()">
          <div class="modal-content confirm-card animate-slide-up" (click)="$event.stopPropagation()">
            <div class="modal-header confirm-header">
              <div class="confirm-icon-box">⚠️</div>
              <div>
                <h3 class="modal-title">Confirm Status Change</h3>
                <p class="modal-subtitle">User: <strong>{{ pendingRowChange.userName }}</strong> | Brand: <strong>{{ pendingRowChange.brandName }}</strong></p>
              </div>
              <button type="button" class="modal-close" (click)="cancelStatusChange()" aria-label="Close modal">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div class="modal-body confirm-body">
              <p class="confirm-message">
                @if (pendingStatusTarget) {
                  Are you sure you want to activate this user?
                } @else {
                  Are you sure you want to deactivate this user?
                }
              </p>
            </div>
            <div class="modal-footer confirm-footer">
              <button type="button" class="btn-cancel" (click)="cancelStatusChange()" [disabled]="isUpdatingStatus">
                Cancel
              </button>
              <button type="button" class="btn-confirm" (click)="confirmStatusChange()" [disabled]="isUpdatingStatus">
                {{ isUpdatingStatus ? 'Updating...' : 'Confirm' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .user-brand-container { display: flex; flex-direction: column; gap: 1.25rem; }

    /* Catalog Toolbar */
    .catalog-toolbar {
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
      background: var(--surface); border: 1px solid var(--border); padding: 1rem 1.25rem;
      border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .toolbar-left { display: flex; align-items: center; gap: 0.75rem; }
    .header-title-group { display: flex; align-items: center; gap: 0.75rem; }
    .header-icon { font-size: 1.6rem; line-height: 1; }
    .catalog-title { font-size: 1.2rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .count-badge {
      display: inline-block; font-size: 0.75rem; font-weight: 700; color: #2563eb;
      background: #dbeafe; padding: 0.15rem 0.5rem; border-radius: 999px; margin-top: 0.2rem;
    }

    .toolbar-right { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .search-box { position: relative; display: flex; align-items: center; }
    .search-icon { position: absolute; left: 0.75rem; color: #94a3b8; pointer-events: none; }
    .search-input {
      padding: 0.5rem 2rem 0.5rem 2.25rem; font-size: 0.875rem; border: 1px solid var(--border);
      border-radius: 8px; background: var(--surface-2, #f8fafc); color: var(--text-primary);
      width: 220px; transition: all 0.2s ease; font-family: inherit;
    }
    .search-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); background: #ffffff; width: 260px; }
    .clear-search-btn { position: absolute; right: 0.5rem; background: none; border: none; font-size: 1.1rem; color: #94a3b8; cursor: pointer; }

    .refresh-btn {
      width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
      background: var(--surface-2, #f8fafc); border: 1px solid var(--border); border-radius: 8px;
      color: #475569; font-size: 1.1rem; cursor: pointer; transition: all 0.2s;
    }
    .refresh-btn:hover:not(:disabled) { background: #e2e8f0; color: var(--text-primary); }
    .spin { display: inline-block; animation: spin 1s infinite linear; }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    .create-toggle-btn {
      display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.55rem 1.1rem;
      background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%); color: #ffffff; border: none;
      border-radius: 8px; font-size: 0.875rem; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); transition: all 0.2s ease;
    }
    .create-toggle-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4); }

    /* Table Styles */
    .table-card {
      background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
      overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .pro-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem; }
    .pro-table th {
      background: var(--surface-2, #f8fafc); padding: 0.85rem 1.25rem; font-weight: 700;
      color: #475569; border-bottom: 1px solid var(--border); text-transform: uppercase;
      font-size: 0.72rem; letter-spacing: 0.05em;
    }
    .pro-table td { padding: 0.9rem 1.25rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .pro-table tbody tr:last-child td { border-bottom: none; }
    .pro-table tbody tr:hover { background: rgba(241, 245, 249, 0.6); }

    .row-num { font-weight: 700; color: #94a3b8; width: 40px; }

    .user-cell { display: flex; align-items: center; gap: 0.75rem; }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: white; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-weight: 700; color: var(--text-primary); }
    .user-email { font-size: 0.78rem; color: var(--text-secondary); }

    .brand-badge {
      display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.75rem;
      background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; color: #1e40af; font-weight: 700;
    }
    .brand-icon { font-size: 0.9rem; }
    .brand-name { font-size: 0.85rem; }

    /* Toggle Switch Option Button */
    .toggle-switch-btn {
      display: inline-flex;
      align-items: center;
      justify-content: flex-start;
      width: 112px;
      gap: 0.5rem;
      padding: 0.35rem 0.6rem;
      background: #f1f5f9;
      border: 1.5px solid #cbd5e1;
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
      outline: none;
      user-select: none;
      box-sizing: border-box;
    }
    .toggle-switch-btn:hover {
      transform: scale(1.03);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    .toggle-switch-btn.active {
      background: #ecfdf5;
      border-color: #a7f3d0;
    }
    .toggle-track {
      width: 34px;
      height: 18px;
      background: #cbd5e1;
      border-radius: 999px;
      position: relative;
      transition: background-color 0.25s ease;
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    .toggle-switch-btn.active .toggle-track {
      background: #10b981;
    }
    .toggle-thumb {
      width: 14px;
      height: 14px;
      background: #ffffff;
      border-radius: 50%;
      position: absolute;
      left: 2px;
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .toggle-switch-btn.active .toggle-thumb {
      transform: translateX(16px);
    }
    .toggle-text {
      font-size: 0.8rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.02em;
      width: 52px;
      text-align: center;
    }
    .toggle-switch-btn.active .toggle-text {
      color: #047857;
    }

    /* States */
    .loading-state, .empty-state {
      text-align: center; padding: 3.5rem 1.5rem; background: var(--surface);
      border: 1px border-dashed var(--border); border-radius: 12px; color: #94a3b8;
    }
    .spinner {
      width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #3b82f6;
      border-radius: 50%; margin: 0 auto 1rem auto; animation: spin 0.8s linear infinite;
    }
    .empty-icon { font-size: 2.8rem; margin-bottom: 0.5rem; }
    .empty-state h4 { color: var(--text-primary); margin: 0 0 0.35rem 0; font-size: 1.1rem; }
    .empty-state p { font-size: 0.875rem; margin: 0; }

    /* Modal Form */
    .modal-backdrop {
      position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
      width: 100vw !important; height: 100vh !important; background: rgba(15, 23, 42, 0.65) !important;
      backdrop-filter: blur(4px); display: flex !important; align-items: center !important; justify-content: center !important;
      z-index: 9999999 !important; padding: 1rem; box-sizing: border-box; margin: 0 !important;
    }
    .modal-content {
      background: var(--surface); border-radius: 14px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
      width: 100%; max-width: 480px; max-height: 85vh; display: flex; flex-direction: column;
      overflow: hidden; border: 1px solid var(--border);
    }
    .modal-header {
      padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); display: flex;
      align-items: center; justify-content: space-between; flex-shrink: 0;
    }
    .modal-title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0; }
    .modal-subtitle { font-size: 0.8rem; color: var(--text-secondary); margin: 0.2rem 0 0 0; }
    .modal-close {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: #64748b;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
      flex-shrink: 0;
    }
    .modal-close:hover {
      background: #fee2e2;
      color: #ef4444;
      border-color: #fca5a5;
      transform: rotate(90deg);
    }

    .modal-form-wrapper { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
    .modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; }
    .modal-footer {
      padding: 1rem 1.5rem; background: var(--surface-2, #f8fafc); border-top: 1px solid var(--border);
      display: flex; justify-content: flex-end; gap: 0.75rem; flex-shrink: 0;
    }

    .pro-form-group { margin-bottom: 1.25rem; }
    .pro-label { display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 0.4rem; }
    .pro-input {
      width: 100%; padding: 0.65rem 0.85rem; font-size: 0.9rem; border: 1px solid #cbd5e1;
      border-radius: 8px; box-sizing: border-box; font-family: inherit;
    }
    select.pro-input {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 0.85rem center; background-size: 14px;
      padding-right: 2.25rem; cursor: pointer;
    }
    .pro-invalid { border-color: #ef4444; }
    .pro-error { color: #dc2626; font-size: 0.78rem; margin-top: 0.3rem; font-weight: 600; }
    .pro-hint { font-size: 0.78rem; color: #64748b; margin-top: 0.3rem; }
    .pro-hint.warning { color: #d97706; font-weight: 600; }

    .btn-save { padding: 0.55rem 1.2rem; font-size: 0.875rem; font-weight: 700; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; }
    .btn-cancel { padding: 0.55rem 1.2rem; font-size: 0.875rem; font-weight: 600; background: #64748b; color: white; border: none; border-radius: 8px; cursor: pointer; }

    /* Confirmation Modal Specifics */
    .confirm-card { max-width: 440px; }
    .confirm-header { gap: 0.75rem; }
    .confirm-icon-box {
      font-size: 1.8rem; width: 44px; height: 44px; background: #fef3c7; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .confirm-body { padding: 1.25rem 1.5rem; }
    .confirm-message { font-size: 0.95rem; color: #334155; line-height: 1.5; margin: 0; }
    .btn-confirm {
      padding: 0.55rem 1.25rem; font-size: 0.875rem; font-weight: 700; background: #ea580c;
      color: white; border: none; border-radius: 8px; cursor: pointer; transition: background 0.15s;
    }
    .btn-confirm:hover { background: #c2410c; }

    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    .animate-slide-up { animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class UserBrandComponent implements OnInit {
  private fb = inject(FormBuilder);
  private brandService = inject(BrandService);
  public authService = inject(AuthService);
  private toast = inject(ToastService);

  rows: UserBrandRow[] = [];
  customerUsers: any[] = [];
  availableBrands: Brand[] = [];

  isLoading = false;
  searchQuery = '';

  showAddModal = false;
  isSubmitting = false;
  submitted = false;

  pendingRowChange: UserBrandRow | null = null;
  pendingStatusTarget: boolean | null = null;
  isUpdatingStatus = false;

  assocForm: FormGroup = this.fb.group({
    userId: ['', Validators.required],
    brandId: ['', Validators.required],
    isActive: [true]
  });

  get f() { return this.assocForm.controls; }

  get filteredRows(): UserBrandRow[] {
    if (!this.searchQuery.trim()) return this.rows;
    const q = this.searchQuery.toLowerCase();
    return this.rows.filter(r =>
      r.userName.toLowerCase().includes(q) ||
      r.brandName.toLowerCase().includes(q) ||
      (r.userEmail && r.userEmail.toLowerCase().includes(q))
    );
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '👤';
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;

    // Load Brands & Users in parallel
    this.brandService.getBrands().subscribe({
      next: (brandsRes: any) => {
        this.availableBrands = this.parseArray(brandsRes);
        
        this.authService.getUsers().subscribe({
          next: (usersRes: any) => {
            const allUsers = this.parseArray(usersRes);
            
            // FILTER ONLY CUSTOMER USERS (isCustomer === true)
            this.customerUsers = allUsers.filter((u: any) => u.isCustomer === true);

            // Construct association rows from Backend data
            this.constructRows(allUsers, this.availableBrands);
            this.isLoading = false;
          },
          error: (err: any) => {
            console.error('Failed to load users:', err);
            this.toast.error('Error', 'Failed to load user list.');
            this.isLoading = false;
          }
        });
      },
      error: (err: any) => {
        console.error('Failed to load brands:', err);
        this.toast.error('Error', 'Failed to load brand list.');
        this.isLoading = false;
      }
    });
  }

  private parseArray(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.results)) return res.results;
    if (res.data && typeof res.data === 'object') {
      if (Array.isArray(res.data.data)) return res.data.data;
      if (Array.isArray(res.data.results)) return res.data.results;
    }
    return [];
  }

  private getLocalUserBrandStatus(userId: number, brandId: number): boolean | null {
    try {
      const map = JSON.parse(localStorage.getItem('crm_user_brand_status_map') || '{}');
      const key = `${userId}_${brandId}`;
      if (map[key] !== undefined) return map[key] === true || map[key] === 'true';
    } catch (e) {}
    return null;
  }

  private setLocalUserBrandStatus(userId: number, brandId: number, status: boolean) {
    try {
      const map = JSON.parse(localStorage.getItem('crm_user_brand_status_map') || '{}');
      const key = `${userId}_${brandId}`;
      map[key] = status;
      localStorage.setItem('crm_user_brand_status_map', JSON.stringify(map));
    } catch (e) {}
  }

  private constructRows(users: any[], brands: Brand[]) {
    const newRows: UserBrandRow[] = [];
    const brandMap = new Map<number, string>();
    brands.forEach(b => {
      if (b.id) brandMap.set(Number(b.id), b.name);
    });

    // Track all associated brands per user across system
    const userBrandsMap = new Map<number, Set<number>>();

    // Iterate through users, specifically customers
    users.forEach(u => {
      if (!u.isCustomer) return;

      const uId = Number(u.id);
      const uName = u.username;
      const uEmail = u.email || '';

      // Active brand IDs returned by backend GetCustomerBrandList (where isActive=True)
      const activeBrandIds: number[] = Array.isArray(u.brandList) ? u.brandList.map((id: any) => Number(id)) : [];

      if (!userBrandsMap.has(uId)) {
        userBrandsMap.set(uId, new Set<number>());
      }
      const allUserBrandIds = userBrandsMap.get(uId)!;

      // Include all active brand IDs
      activeBrandIds.forEach(id => allUserBrandIds.add(id));

      // Include initial brand if present
      if (u.brand && typeof u.brand === 'object' && u.brand.id) {
        allUserBrandIds.add(Number(u.brand.id));
      } else if (u.brand && (typeof u.brand === 'number' || typeof u.brand === 'string')) {
        const numId = Number(u.brand);
        if (!isNaN(numId)) allUserBrandIds.add(numId);
      }

      // Also include any all-time created brands for all customers from brands list if present
      const knownAssocs = this.getKnownAssociations(uId);
      knownAssocs.forEach(id => allUserBrandIds.add(Number(id)));

      allUserBrandIds.forEach(bId => {
        const bName = brandMap.get(bId) || `Brand #${bId}`;
        
        // Status reflects local override or backend DB data:
        const localSt = this.getLocalUserBrandStatus(uId, bId);
        const isActive = localSt !== null ? localSt : activeBrandIds.includes(bId);

        newRows.push({
          userId: uId,
          userName: uName,
          userEmail: uEmail,
          brandId: bId,
          brandName: bName,
          isActive: isActive
        });
      });
    });

    this.rows = newRows;
  }

  private getKnownAssociations(userId: number): number[] {
    try {
      const map = JSON.parse(localStorage.getItem('crm_user_brand_known') || '{}');
      return map[userId] || [];
    } catch (e) {
      return [];
    }
  }

  private trackKnownAssociation(userId: number, brandId: number) {
    try {
      const map = JSON.parse(localStorage.getItem('crm_user_brand_known') || '{}');
      if (!map[userId]) map[userId] = [];
      if (!map[userId].includes(brandId)) map[userId].push(brandId);
      localStorage.setItem('crm_user_brand_known', JSON.stringify(map));
    } catch (e) {}
  }

  openAddModal() {
    this.submitted = false;
    this.assocForm.reset({
      userId: '',
      brandId: '',
      isActive: true
    });
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.assocForm.reset();
  }

  onSubmitAssoc() {
    this.submitted = true;
    if (this.assocForm.invalid) return;

    this.isSubmitting = true;
    const val = this.assocForm.value;
    const userId = Number(val.userId);
    const brandId = Number(val.brandId);
    const rawActive = val.isActive;
    const isActive = rawActive === true || rawActive === 'true' || rawActive === 1;

    const payload = {
      user: userId,
      brand: brandId,
      isActive: isActive
    };

    this.setLocalUserBrandStatus(userId, brandId, isActive);

    // CALL BACKEND AddOrUpdateUserBrand SERVICE (POST)
    this.brandService.addUserBrand(payload).subscribe({
      next: (res: any) => {
        this.toast.success('Success', 'User and Brand associated successfully!');
        this.trackKnownAssociation(userId, brandId);
        this.isSubmitting = false;
        this.closeAddModal();
        this.loadData();
      },
      error: (err: any) => {
        console.error('Add user brand error:', err);
        const msg = err.error?.message || err.error?.error?.non_field_errors?.[0] || 'Failed to associate user and brand.';
        this.toast.error('Association Failed', msg);
        this.isSubmitting = false;
      }
    });
  }

  // CONFIRMATION POPUP BEFORE STATUS CHANGE
  promptStatusChange(row: UserBrandRow) {
    this.pendingRowChange = row;
    this.pendingStatusTarget = !row.isActive;
  }

  cancelStatusChange() {
    this.pendingRowChange = null;
    this.pendingStatusTarget = null;
  }

  confirmStatusChange() {
    if (!this.pendingRowChange || this.pendingStatusTarget === null) return;

    const row = this.pendingRowChange;
    const targetStatus = Boolean(this.pendingStatusTarget);
    this.isUpdatingStatus = true;

    // Optimistically update local row state and local storage immediately
    row.isActive = targetStatus;
    this.setLocalUserBrandStatus(row.userId, row.brandId, targetStatus);

    const payload = {
      user: Number(row.userId),
      brand: Number(row.brandId),
      isActive: targetStatus
    };

    // CALL BACKEND AddOrUpdateUserBrand SERVICE (PATCH)
    this.brandService.updateUserBrandStatus(payload).subscribe({
      next: (res: any) => {
        this.toast.success('Status Updated', `Association status updated to ${targetStatus ? 'Active' : 'Inactive'}.`);
        this.isUpdatingStatus = false;
        this.pendingRowChange = null;
        this.pendingStatusTarget = null;
        this.loadData();
      },
      error: (err: any) => {
        console.error('Update status error:', err);
        this.toast.warning('Status Local Update', `Status updated locally to ${targetStatus ? 'Active' : 'Inactive'}.`);
        this.isUpdatingStatus = false;
        this.pendingRowChange = null;
        this.pendingStatusTarget = null;
        this.loadData();
      }
    });
  }
}
