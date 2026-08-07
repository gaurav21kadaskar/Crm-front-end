import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrandService } from '../../../../core/services/brand.service';
import { Brand } from '../../../../core/models/brand.model';

@Component({
  selector: 'app-brand-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="panel-section animate-fade-in">
      <div class="create-toggle-container">
        <button class="create-toggle-btn" (click)="showCreateForm = true">
          <span class="plus-icon">+</span>
          <span>Create New Brand</span>
        </button>
      </div>

      <!-- Create Modal -->
      @if (showCreateForm) {
        <div class="modal-backdrop animate-fade-in" (click)="showCreateForm = false">
          <div class="modal-content animate-slide-up" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Create Brand</h3>
              <button class="modal-close" (click)="showCreateForm = false">&times;</button>
            </div>
            <form [formGroup]="brandForm" (ngSubmit)="onSubmit()">
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
                    placeholder="Enter brand name"
                  />
                  @if (submitted && f['name'].errors?.['required']) {
                    <div class="pro-error">Brand name is required</div>
                  }
                </div>

                <div class="pro-form-group">
                  <label class="pro-label" for="brandDesc">Description</label>
                  <textarea 
                    id="brandDesc" 
                    class="pro-input" 
                    formControlName="description" 
                    placeholder="Enter brand description"
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn-cancel" (click)="showCreateForm = false">Cancel</button>
                <button type="submit" class="btn-save" [disabled]="isLoading">
                  {{ isLoading ? 'Creating...' : 'Create' }}
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
            <form [formGroup]="editForm" (ngSubmit)="onUpdate(editingBrandId)">
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

      <!-- Global Messages for success / non-modal alerts -->
      @if (successMessage) {
        <div class="success-alert animate-fade-in">{{ successMessage }}</div>
      }

      <!-- Brands List -->
      <div class="list-container">
        <div class="list-header">
          <h4 class="list-title">Available Brands</h4>
          <button class="refresh-btn" (click)="loadBrands()" [disabled]="loadingList">
            {{ loadingList ? 'Loading...' : '↻ Refresh' }}
          </button>
        </div>

        @if (loadingList) {
          <div class="loading-state">Loading brands...</div>
        } @else if (brands.length === 0) {
          <div class="empty-state">No brands found. Create your first brand above.</div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Brand Name</th>
                <th>Description</th>
                <th style="width: 180px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (brand of brands; track brand.id) {
                <tr>
                  <td class="id-cell">{{ brand.id }}</td>
                  <td class="name-cell">{{ brand.name }}</td>
                  <td class="desc-cell">{{ brand.description || '—' }}</td>
                  <td class="actions-cell">
                    @if (deletingBrandId === brand.id) {
                      <div class="delete-confirm-box">
                        <span class="confirm-msg">Delete?</span>
                        <button class="btn-yes" (click)="onDelete(brand.id!)">Yes</button>
                        <button class="btn-no" (click)="deletingBrandId = null">No</button>
                      </div>
                    } @else {
                      <div class="action-btns">
                        <button class="btn-action-edit" (click)="startEdit(brand)">Edit</button>
                        <button class="btn-action-delete" (click)="deletingBrandId = brand.id || null">Delete</button>
                      </div>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styles: [`
    .panel-section { display: flex; flex-direction: column; gap: 1.5rem; }

    .success-alert { padding: 0.75rem; background-color: #dcfce7; color: #166534; border-radius: 6px; margin-bottom: 1rem; font-size: 0.875rem; }
    .error-alert { padding: 0.75rem; background-color: #fee2e2; color: #991b1b; border-radius: 6px; margin-bottom: 1rem; font-size: 0.875rem; }
    
    .pro-form-group { margin-bottom: 1.25rem; }
    .pro-label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.5rem; }
    .pro-input { width: 100%; padding: 0.625rem 0.875rem; font-size: 0.95rem; color: var(--text-primary); background-color: var(--surface); border: 1px solid #cbd5e1; border-radius: 6px; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; font-family: inherit; }
    .pro-input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.15); }
    .pro-input.pro-invalid { border-color: #ef4444; }
    .pro-error { color: #ef4444; font-size: 0.825rem; margin-top: 0.375rem; }

    /* Collapsible Create Button */
    .create-toggle-container { display: flex; justify-content: flex-start; }
    .create-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.65rem 1.25rem;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #ffffff;
      border: none;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.35);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
    }
    .create-toggle-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px 0 rgba(79, 70, 229, 0.45);
      background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
    }
    .create-toggle-btn:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px 0 rgba(79, 70, 229, 0.25);
    }
    .create-toggle-btn .plus-icon {
      width: 20px;
      height: 20px;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      line-height: 1;
    }

    /* Action Buttons */
    .actions-cell { vertical-align: middle; white-space: nowrap; }
    .action-btns { display: inline-flex; gap: 0.5rem; align-items: center; }
    .btn-action-edit { padding: 0.375rem 0.75rem; font-size: 0.825rem; font-weight: 600; border: 1px solid #cbd5e1; border-radius: 6px; background-color: var(--surface); color: #334155; cursor: pointer; transition: all 0.15s ease; }
    .btn-action-edit:hover { background-color: #f1f5f9; color: var(--text-primary); border-color: #94a3b8; }
    .btn-action-delete { padding: 0.375rem 0.75rem; font-size: 0.825rem; font-weight: 600; border: 1px solid #fee2e2; border-radius: 6px; background-color: var(--surface); color: #dc2626; cursor: pointer; transition: all 0.15s ease; }
    .btn-action-delete:hover { background-color: #fef2f2; color: #b91c1c; border-color: #fca5a5; }

    /* Modal Layout CSS */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      padding: 1rem;
      box-sizing: border-box;
    }
    .modal-content {
      background-color: var(--surface);
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 500px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .modal-content form {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }
    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-light);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .modal-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }
    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      line-height: 1;
    }
    .modal-close:hover { color: var(--text-primary); }
    .modal-body { padding: 1.5rem; flex: 1; overflow-y: auto; }
    .modal-footer {
      padding: 1rem 1.5rem;
      background-color: var(--surface-2, #f8fafc);
      border-top: 1px solid var(--border-light);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    .btn-save { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 600; background-color: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; }
    .btn-save:hover { background-color: #059669; }
    .btn-save:disabled { background-color: #a7f3d0; cursor: not-allowed; }
    .btn-cancel { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 600; background-color: var(--text-secondary); color: white; border: none; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; }
    .btn-cancel:hover { background-color: #475569; }

    /* Delete Confirm Box */
    .delete-confirm-box { display: flex; align-items: center; gap: 0.5rem; background-color: #fef2f2; border: 1px solid #fee2e2; padding: 0.25rem 0.5rem; border-radius: 6px; }
    .confirm-msg { font-size: 0.825rem; font-weight: 600; color: #991b1b; }
    .btn-yes { padding: 0.25rem 0.5rem; font-size: 0.775rem; font-weight: 700; background-color: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .btn-yes:hover { background-color: #b91c1c; }
    .btn-no { padding: 0.25rem 0.5rem; font-size: 0.775rem; font-weight: 700; background-color: var(--text-secondary); color: white; border: none; border-radius: 4px; cursor: pointer; }
    .btn-no:hover { background-color: #475569; }

    /* List */
    .list-container { background: var(--surface); border-radius: 8px; border: 1px solid var(--border); overflow: hidden; }
    .list-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
    .list-title { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin: 0; }
    .refresh-btn { padding: 0.375rem 0.875rem; font-size: 0.825rem; background: #f8fafc; border: 1px solid var(--border); border-radius: 6px; cursor: pointer; color: #475569; font-weight: 500; transition: all 0.2s; }
    .refresh-btn:hover:not(:disabled) { background: #e2e8f0; }
    .refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .loading-state, .empty-state { padding: 2rem; text-align: center; color: #94a3b8; font-size: 0.9rem; }

    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background: #f8fafc; padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); }
    .data-table td { padding: 0.875rem 1rem; font-size: 0.9rem; color: #334155; border-bottom: 1px solid #f1f5f9; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: #f8fafc; }
    .id-cell { color: #94a3b8; font-size: 0.8rem; width: 60px; }
    .name-cell { font-weight: 500; color: var(--text-primary); }
    .desc-cell { color: var(--text-secondary); max-width: 300px; }

    .animate-fade-in {
      animation: fadeIn 0.25s ease-out;
    }
    .animate-slide-up {
      animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(16px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class BrandFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private brandService = inject(BrandService);

  brands: Brand[] = [];
  loadingList = false;

  brandForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  editForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  isLoading = false;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  showCreateForm = false;
  editingBrandId: number | null = null;
  deletingBrandId: number | null = null;
  isUpdating = false;

  get f() { return this.brandForm.controls; }

  ngOnInit() {
    this.loadBrands();
  }

  private parseArray(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.results)) return res.results;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  }

  loadBrands() {
    this.loadingList = true;

    this.brandService.getBrands().subscribe({
      next: (response: any) => {
        this.brands = this.parseArray(response);
        this.loadingList = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingList = false;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.brandForm.invalid) return;

    this.isLoading = true;
    this.brandService.createBrand(this.brandForm.value).subscribe({
      next: () => {
        this.successMessage = 'Brand created successfully!';
        this.brandForm.reset();
        this.submitted = false;
        this.isLoading = false;
        this.showCreateForm = false;
        this.loadBrands();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Failed to create brand. Please try again.';
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
      description: brand.description || ''
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

    this.brandService.updateBrand(id, this.editForm.value).subscribe({
      next: () => {
        this.successMessage = 'Brand updated successfully!';
        this.editingBrandId = null;
        this.editForm.reset();
        this.isUpdating = false;
        this.loadBrands();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Failed to update brand. Please try again.';
        this.isUpdating = false;
      }
    });
  }

  onDelete(id: number): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.brandService.deleteBrand(id).subscribe({
      next: () => {
        this.successMessage = 'Brand deleted successfully!';
        this.deletingBrandId = null;
        this.loadBrands();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Failed to delete brand. Please try again.';
        this.deletingBrandId = null;
      }
    });
  }
}
