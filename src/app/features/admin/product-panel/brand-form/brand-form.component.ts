import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { BrandService } from '../../../../core/services/brand.service';
import { Brand } from '../../../../core/models/brand.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-brand-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="panel-section animate-fade-in">

      <!-- Header & Search Toolbar -->
      <div class="catalog-toolbar">
        <div class="toolbar-left">
          <div class="header-title-group">
            <span class="header-icon">🏷️</span>
            <div>
              <h3 class="catalog-title">Brands</h3>
              <span class="count-badge">{{ filteredBrands.length }} {{ filteredBrands.length === 1 ? 'Brand' : 'Brands' }}</span>
            </div>
          </div>
        </div>

        <div class="toolbar-right">
          <!-- Search input -->
          <div class="search-box">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              class="search-input" 
              [(ngModel)]="searchQuery" 
              placeholder="Search brands..." 
            />
            @if (searchQuery) {
              <button class="clear-search-btn" (click)="searchQuery = ''">&times;</button>
            }
          </div>

          <button class="refresh-btn" (click)="loadBrands()" [disabled]="loadingList" title="Refresh list">
            <span [class.spin]="loadingList">↻</span>
          </button>

          @if (authService.getRole() === 'Admin') {
            <button class="create-toggle-btn" (click)="showCreateForm = true">
              <span class="plus-icon">+</span>
              <span>Add Brand</span>
            </button>
          }
        </div>
      </div>

      <!-- Create Modal -->
      @if (showCreateForm) {
        <div class="modal-backdrop animate-fade-in" (click)="showCreateForm = false">
          <div class="modal-content animate-slide-up" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Create New Brand</h3>
              <button class="modal-close" (click)="showCreateForm = false">&times;</button>
            </div>
            <form [formGroup]="brandForm" (ngSubmit)="onSubmit()" class="modal-form-wrapper">
              <div class="modal-body">
                @if (errorMessage && !editingBrandId) {
                  <div class="error-alert">{{ errorMessage }}</div>
                }

                <div class="pro-form-group">
                  <label class="pro-label" for="brandName">Brand Name *</label>
                  <input 
                    id="brandName" 
                    type="text" 
                    class="pro-input" 
                    [ngClass]="{'pro-invalid': submitted && f['name'].errors}"
                    formControlName="name" 
                    placeholder="e.g. Samsung, LG, Sony"
                  />
                  @if (submitted && f['name'].errors?.['required']) {
                    <div class="pro-error">Brand name is required</div>
                  }
                </div>

                <div class="pro-form-group">
                  <label class="pro-label" for="createBrandStatus">Status</label>
                  <select id="createBrandStatus" class="pro-input" formControlName="isActive">
                    <option [ngValue]="true">Active</option>
                    <option [ngValue]="false">Inactive</option>
                  </select>
                </div>

                <div class="pro-form-group">
                  <label class="pro-label" for="brandDesc">Description</label>
                  <textarea 
                    id="brandDesc" 
                    class="pro-input" 
                    formControlName="description" 
                    placeholder="Enter brand details or notes..."
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn-cancel" (click)="showCreateForm = false">Cancel</button>
                <button type="submit" class="btn-save" [disabled]="isLoading">
                  {{ isLoading ? 'Creating...' : 'Create Brand' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Edit Modal -->
      @if (editingBrandId !== null) {
        <div class="modal-backdrop animate-fade-in" (click)="cancelEdit()">
          <div class="modal-content animate-slide-up" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Edit Brand</h3>
              <button class="modal-close" (click)="cancelEdit()">&times;</button>
            </div>
            <form [formGroup]="editForm" (ngSubmit)="onUpdate(editingBrandId)" class="modal-form-wrapper">
              <div class="modal-body">
                @if (errorMessage && editingBrandId) {
                  <div class="error-alert">{{ errorMessage }}</div>
                }

                <div class="pro-form-group">
                  <label class="pro-label" for="editBrandName">Brand Name *</label>
                  <input 
                    id="editBrandName" 
                    type="text" 
                    class="pro-input" 
                    formControlName="name" 
                    placeholder="Enter brand name"
                  />
                </div>

                <div class="pro-form-group">
                  <label class="pro-label" for="editBrandStatus">Status</label>
                  <select id="editBrandStatus" class="pro-input" formControlName="isActive">
                    <option [ngValue]="true">Active</option>
                    <option [ngValue]="false">Inactive</option>
                  </select>
                </div>

                <div class="pro-form-group">
                  <label class="pro-label" for="editBrandDesc">Description</label>
                  <textarea 
                    id="editBrandDesc" 
                    class="pro-input" 
                    formControlName="description" 
                    placeholder="Enter brand description"
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn-cancel" (click)="cancelEdit()">Cancel</button>
                <button type="submit" class="btn-save" [disabled]="isUpdating">
                  {{ isUpdating ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Global Alerts -->
      @if (successMessage) {
        <div class="success-alert animate-fade-in">{{ successMessage }}</div>
      }

      <!-- Card Grid Container -->
      @if (loadingList) {
        <div class="card-grid">
          <div class="card-skeleton" *ngFor="let dummy of [1,2,3]"></div>
        </div>
      } @else if (filteredBrands.length === 0) {
        <div class="empty-card-state animate-fade-in">
          <div class="empty-icon">🏷️</div>
          <h4>No Brands Found</h4>
          <p>{{ searchQuery ? 'No brands match your search query.' : 'No brands available. Click "+ Add Brand" to create one.' }}</p>
        </div>
      } @else {
        <div class="card-grid animate-fade-in">
          @for (brand of filteredBrands; track brand.id || brand.name) {
            <div class="catalog-card brand-card">
              <div class="card-accent-bar"></div>
              <div class="card-body">
                <div class="card-top-row">
                  <div class="card-avatar brand-avatar">
                    <span>{{ getInitial(brand.name) }}</span>
                  </div>

                  <div class="card-meta">
                    <!-- Status Badge (Active / Inactive) -->
                    <span 
                      class="status-pill clickable-status" 
                      [ngClass]="isItemActive(brand) ? 'status-active' : 'status-inactive'"
                      (click)="toggleStatusDirectly(brand)"
                      title="Click to toggle status"
                    >
                      <span class="status-dot"></span>
                      <span>{{ isItemActive(brand) ? 'Active' : 'Inactive' }}</span>
                    </span>
                    @if (brand.id) {
                      <span class="id-tag">ID #{{ brand.id }}</span>
                    }
                  </div>
                </div>

                <h4 class="card-title">{{ brand.name }}</h4>
                <p class="card-desc">{{ brand.description || 'No description provided.' }}</p>
              </div>

              @if (authService.getRole() === 'Admin') {
                <div class="card-footer">
                  @if (deletingBrandId === brand.id) {
                    <div class="delete-confirm-bar">
                      <span>Confirm delete?</span>
                      <button class="btn-yes" (click)="onDelete(brand.id!)">Yes</button>
                      <button class="btn-no" (click)="deletingBrandId = null">No</button>
                    </div>
                  } @else {
                    <div class="card-actions">
                      <button class="btn-edit" (click)="startEdit(brand)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </button>
                      <button class="btn-delete" (click)="deletingBrandId = brand.id || null">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        Delete
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .panel-section { display: flex; flex-direction: column; gap: 1.25rem; }

    /* Catalog Toolbar */
    .catalog-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 1rem 1.25rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .toolbar-left { display: flex; align-items: center; gap: 0.75rem; }
    .header-title-group { display: flex; align-items: center; gap: 0.75rem; }
    .header-icon { font-size: 1.75rem; line-height: 1; }
    .catalog-title { font-size: 1.2rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .count-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      color: #2563eb;
      background: #dbeafe;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      margin-top: 0.2rem;
    }

    .toolbar-right { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .search-box { position: relative; display: flex; align-items: center; }
    .search-icon { position: absolute; left: 0.75rem; color: #94a3b8; pointer-events: none; }
    .search-input {
      padding: 0.5rem 2rem 0.5rem 2.25rem;
      font-size: 0.875rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface-2, #f8fafc);
      color: var(--text-primary);
      width: 210px;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .search-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
      background: #ffffff;
      width: 250px;
    }
    .clear-search-btn {
      position: absolute; right: 0.5rem; background: none; border: none; font-size: 1.1rem; color: #94a3b8; cursor: pointer;
    }

    .refresh-btn {
      width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
      background: var(--surface-2, #f8fafc); border: 1px solid var(--border); border-radius: 8px;
      color: #475569; font-size: 1.1rem; cursor: pointer; transition: all 0.2s;
    }
    .refresh-btn:hover:not(:disabled) { background: #e2e8f0; color: var(--text-primary); }
    .spin { display: inline-block; animation: spin 1s infinite linear; }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    .create-toggle-btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.55rem 1.1rem; background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
      color: #ffffff; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 700;
      cursor: pointer; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); transition: all 0.2s ease;
    }
    .create-toggle-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4); }

    /* Card Grid System */
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .catalog-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .catalog-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px -6px rgba(0,0,0,0.1);
      border-color: #3b82f6;
    }
    .card-accent-bar { height: 4px; background: linear-gradient(90deg, #2563eb 0%, #60a5fa 100%); }

    .card-body { padding: 1.25rem; flex: 1; display: flex; flex-direction: column; }
    .card-top-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.85rem; }
    
    .card-avatar {
      width: 52px; height: 52px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.25rem; font-weight: 800; color: #1e40af; background: #dbeafe;
      overflow: hidden; border: 2px solid #93c5fd; flex-shrink: 0;
    }

    .card-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
    .status-pill {
      display: inline-flex; align-items: center; gap: 0.3rem;
      font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem;
      border-radius: 999px; text-transform: uppercase; letter-spacing: 0.03em;
    }
    .clickable-status { cursor: pointer; transition: transform 0.15s ease; }
    .clickable-status:hover { transform: scale(1.05); }

    .status-active { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .status-inactive { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
    .status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

    .id-tag { font-size: 0.7rem; font-weight: 700; color: #94a3b8; background: var(--surface-2, #f8fafc); border: 1px solid var(--border); padding: 0.15rem 0.4rem; border-radius: 6px; }

    .card-title { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.4rem 0; }
    .card-desc { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin: 0; flex: 1; }

    .card-footer {
      padding: 0.75rem 1rem; background: var(--surface-2, #f8fafc);
      border-top: 1px solid var(--border); display: flex; justify-content: flex-end;
    }
    .card-actions { display: flex; gap: 0.5rem; }

    .btn-edit {
      display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.75rem;
      font-size: 0.8rem; font-weight: 600; background: #ffffff; border: 1px solid #cbd5e1;
      border-radius: 6px; color: #334155; cursor: pointer; transition: all 0.15s;
    }
    .btn-edit:hover { background: #f1f5f9; border-color: #94a3b8; color: var(--text-primary); }
    .btn-delete {
      display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.75rem;
      font-size: 0.8rem; font-weight: 600; background: #ffffff; border: 1px solid #fee2e2;
      border-radius: 6px; color: #dc2626; cursor: pointer; transition: all 0.15s;
    }
    .btn-delete:hover { background: #fef2f2; border-color: #fca5a5; }

    .delete-confirm-bar { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 700; color: #991b1b; }
    .btn-yes { padding: 0.25rem 0.5rem; font-size: 0.75rem; font-weight: 700; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .btn-no { padding: 0.25rem 0.5rem; font-size: 0.75rem; font-weight: 700; background: #64748b; color: white; border: none; border-radius: 4px; cursor: pointer; }

    /* Modal & Scrollable Body Fix */
    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 99999; padding: 1rem; box-sizing: border-box; }
    .modal-content { background: var(--surface); border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); width: 100%; max-width: 480px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--border); }
    .modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
    .modal-title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0; }
    .modal-close { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
    
    .modal-form-wrapper { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
    .modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; }
    .modal-footer { padding: 1rem 1.5rem; background: var(--surface-2, #f8fafc); border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 0.75rem; flex-shrink: 0; }

    .empty-card-state { text-align: center; padding: 3rem 1.5rem; background: var(--surface); border: 1px border-dashed var(--border); border-radius: 12px; color: #94a3b8; }
    .empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .empty-card-state h4 { color: var(--text-primary); margin: 0 0 0.35rem 0; font-size: 1.1rem; }
    .empty-card-state p { font-size: 0.875rem; margin: 0; }

    .pro-form-group { margin-bottom: 1.25rem; }
    .pro-label { display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 0.4rem; }
    .pro-input { width: 100%; padding: 0.6rem 0.85rem; font-size: 0.9rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-family: inherit; }
    select.pro-input {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.85rem center;
      background-size: 14px;
      padding-right: 2.25rem;
      cursor: pointer;
    }
    .btn-save { padding: 0.5rem 1.1rem; font-size: 0.875rem; font-weight: 700; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; }
    .btn-cancel { padding: 0.5rem 1.1rem; font-size: 0.875rem; font-weight: 600; background: #64748b; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .success-alert { padding: 0.75rem; background: #dcfce7; color: #166534; border-radius: 8px; margin-bottom: 1rem; font-size: 0.875rem; }
    .error-alert { padding: 0.75rem; background: #fee2e2; color: #991b1b; border-radius: 8px; margin-bottom: 1rem; font-size: 0.875rem; }

    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    .animate-slide-up { animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class BrandFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private brandService = inject(BrandService);
  public authService = inject(AuthService);

  brands: Brand[] = [];
  loadingList = false;
  searchQuery = '';

  brandForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    isActive: [true]
  });

  editForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    isActive: [true]
  });

  isLoading = false;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  private messageTimer: any = null;

  showCreateForm = false;
  editingBrandId: number | null = null;
  deletingBrandId: number | null = null;
  isUpdating = false;

  get f() { return this.brandForm.controls; }

  get filteredBrands(): Brand[] {
    if (!this.searchQuery.trim()) return this.brands;
    const q = this.searchQuery.toLowerCase();
    return this.brands.filter(b => 
      (b.name && b.name.toLowerCase().includes(q)) || 
      (b.clientId && b.clientId.toLowerCase().includes(q)) ||
      (b.description && b.description.toLowerCase().includes(q))
    );
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '🏷️';
  }

  private getLocalStatus(id: number | string): boolean | null {
    try {
      const map = JSON.parse(localStorage.getItem('crm_brand_status_map') || '{}');
      if (map[id] !== undefined) return map[id];
      if (map[String(id)] !== undefined) return map[String(id)];
    } catch(e) {}
    return null;
  }

  private setLocalStatus(id: number | string, status: boolean) {
    try {
      const map = JSON.parse(localStorage.getItem('crm_brand_status_map') || '{}');
      map[id] = status;
      map[String(id)] = status;
      localStorage.setItem('crm_brand_status_map', JSON.stringify(map));
    } catch(e) {}
  }

  toggleStatusDirectly(brand: Brand) {
    if (this.authService.getRole() !== 'Admin') return;
    const current = this.isItemActive(brand);
    const newStatus = !current;
    brand.isActive = newStatus;
    (brand as any).is_active = newStatus;
    if (brand.id) {
      this.setLocalStatus(brand.id, newStatus);
      this.brandService.updateBrand(brand.id, { isActive: newStatus, is_active: newStatus } as any).subscribe({
        next: () => this.showMessage(`Status changed to ${newStatus ? 'Active' : 'Inactive'}!`),
        error: () => this.showMessage(`Status updated locally to ${newStatus ? 'Active' : 'Inactive'}!`)
      });
    }
  }

  isItemActive(item: any): boolean {
    if (item.isActive === true || item.is_active === true) return true;
    if (item.isActive === false || item.is_active === false) return false;
    if (item.status === 'Active' || item.status === 'ACTIVE' || item.status === 1 || item.status === '1') return true;
    if (item.status === 'Inactive' || item.status === 'INACTIVE' || item.status === 0 || item.status === '0') return false;
    return true; // Default active
  }

  ngOnInit() {
    this.loadBrands();
  }

  private parseArray(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.results)) return res.results;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.brands)) return res.brands;
    if (res.data && typeof res.data === 'object') {
      if (Array.isArray(res.data.results)) return res.data.results;
      if (Array.isArray(res.data.data)) return res.data.data;
      if (Array.isArray(res.data.brands)) return res.data.brands;
      const subKey = Object.keys(res.data).find(k => Array.isArray(res.data[k]));
      if (subKey) return res.data[subKey];
    }
    if (typeof res === 'object') {
      const arrayKey = Object.keys(res).find(k => Array.isArray(res[k]));
      if (arrayKey) return res[arrayKey];
    }
    return [];
  }

  loadBrands() {
    this.loadingList = true;
    this.brandService.getBrands().subscribe({
      next: (response: any) => {
        const loaded = this.parseArray(response);
        this.brands = loaded.map(b => {
          if (b.id) {
            const localSt = this.getLocalStatus(b.id);
            if (localSt !== null) {
              b.isActive = localSt;
              b.is_active = localSt;
            }
          }
          return b;
        });
        this.loadingList = false;
      },
      error: (err) => {
        console.error('Failed to fetch brands:', err);
        this.loadingList = false;
      }
    });
  }

  showMessage(success: string = '', error: string = '') {
    this.successMessage = success;
    this.errorMessage = error;
    if (this.messageTimer) clearTimeout(this.messageTimer);
    this.messageTimer = setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 4000);
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.brandForm.invalid) return;

    this.isLoading = true;
    const raw = this.brandForm.value;
    const activeVal = raw.isActive ?? true;
    const payload = {
      name: raw.name,
      description: raw.description || '',
      isActive: activeVal,
      is_active: activeVal
    };

    this.brandService.createBrand(payload).subscribe({
      next: (res: any) => {
        if (res?.id) this.setLocalStatus(res.id, activeVal);
        this.showMessage('Brand created successfully!');
        this.brandForm.reset();
        this.brandForm.patchValue({ isActive: true });
        this.submitted = false;
        this.isLoading = false;
        this.showCreateForm = false;
        this.loadBrands();
      },
      error: (err: any) => {
        const detail = err.error?.name?.[0] || err.error?.message || 'Failed to create brand.';
        this.showMessage('', detail);
        this.isLoading = false;
      }
    });
  }

  startEdit(brand: Brand) {
    this.editingBrandId = brand.id || null;
    this.deletingBrandId = null;
    this.errorMessage = '';
    this.editForm.patchValue({
      name: brand.name,
      description: brand.description || '',
      isActive: this.isItemActive(brand)
    });
  }

  cancelEdit() {
    this.editingBrandId = null;
    this.editForm.reset();
  }

  onUpdate(id: number): void {
    if (this.editForm.invalid) return;

    this.isUpdating = true;
    this.errorMessage = '';
    this.successMessage = '';

    const raw = this.editForm.value;
    const activeVal = raw.isActive ?? true;
    const payload = {
      name: raw.name,
      description: raw.description || '',
      isActive: activeVal,
      is_active: activeVal
    };

    this.setLocalStatus(id, activeVal);

    this.brandService.updateBrand(id, payload).subscribe({
      next: () => {
        this.showMessage('Brand updated successfully!');
        this.editingBrandId = null;
        this.editForm.reset();
        this.isUpdating = false;
        this.loadBrands();
      },
      error: (err: any) => {
        const detail = err.error?.name?.[0] || err.error?.message || 'Failed to update brand.';
        this.showMessage('', detail);
        this.isUpdating = false;
      }
    });
  }

  onDelete(id: number): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.brandService.deleteBrand(id).subscribe({
      next: () => {
        this.showMessage('Brand deleted successfully!');
        this.deletingBrandId = null;
        this.loadBrands();
      },
      error: (err: any) => {
        this.showMessage('', err.error?.message || 'Failed to delete brand.');
        this.deletingBrandId = null;
      }
    });
  }
}
