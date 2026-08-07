import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductPartService } from '../../../../core/services/product-part.service';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { ProductPart } from '../../../../core/models/product-part.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-product-part-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="panel-section animate-fade-in">
      <div class="create-toggle-container">
        <button class="create-toggle-btn" (click)="showCreateForm = true">
          <span class="plus-icon">+</span>
          <span>Create New Part</span>
        </button>
      </div>

      <!-- Create Modal -->
      @if (showCreateForm) {
        <div class="modal-backdrop animate-fade-in" (click)="showCreateForm = false">
          <div class="modal-content animate-slide-up" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Create Product Part</h3>
              <button class="modal-close" (click)="showCreateForm = false">&times;</button>
            </div>
            <form [formGroup]="partForm" (ngSubmit)="onSubmit()">
              <div class="modal-body">
                @if (errorMessage && !editingPartId) {
                  <div class="error-alert">{{ errorMessage }}</div>
                }

                <div class="pro-form-group">
                  <label class="pro-label" for="productSelect">Product *</label>
                  <select
                    id="productSelect"
                    class="pro-input"
                    [ngClass]="{'pro-invalid': submitted && f['product'].errors}"
                    formControlName="product"
                  >
                    <option value="" disabled selected>Select a product...</option>
                    @for (prod of products; track prod.id) {
                      <option [value]="prod.id">{{ prod.name }}</option>
                    }
                  </select>
                  @if (submitted && f['product'].errors?.['required']) {
                    <div class="pro-error">Product selection is required</div>
                  }
                </div>

                <div class="pro-form-group">
                  <label class="pro-label" for="partName">Part Name *</label>
                  <input
                    id="partName"
                    type="text"
                    class="pro-input"
                    [ngClass]="{'pro-invalid': submitted && f['name'].errors}"
                    formControlName="name"
                    placeholder="Enter part name"
                  />
                  @if (submitted && f['name'].errors?.['required']) {
                    <div class="pro-error">Part name is required</div>
                  }
                </div>

                <div class="pro-form-group">
                  <label class="pro-label" for="partDesc">Description</label>
                  <textarea
                    id="partDesc"
                    class="pro-input"
                    formControlName="description"
                    placeholder="Enter part description"
                    rows="3"
                  ></textarea>
                </div>

                <div class="pro-form-group" style="display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem;">
                  <input type="checkbox" id="isActive" formControlName="isActive" style="width: auto; margin: 0;" />
                  <label class="pro-label" for="isActive" style="margin: 0; cursor: pointer;">Is Active</label>
                </div>

                <div class="pro-form-group">
                  <label class="pro-label" for="partImage">Part Image</label>
                  <input
                    id="partImage"
                    type="file"
                    class="pro-input"
                    (change)="onFileSelected($event)"
                    accept="image/*"
                  />
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
      @if (editingPartId !== null) {
        <div class="modal-backdrop animate-fade-in" (click)="cancelEdit()">
          <div class="modal-content animate-slide-up" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Edit Product Part</h3>
              <button class="modal-close" (click)="cancelEdit()">&times;</button>
            </div>
            <form [formGroup]="editForm" (ngSubmit)="onUpdate(editingPartId)">
              <div class="modal-body">
                @if (errorMessage && editingPartId) {
                  <div class="error-alert">{{ errorMessage }}</div>
                }

                <div class="pro-form-group">
                  <label class="pro-label" for="editPartProduct">Product *</label>
                  <select id="editPartProduct" class="pro-input" formControlName="product">
                    <option value="" disabled>Select a product...</option>
                    @for (p of products; track p.id) {
                      <option [value]="p.id">{{ p.name }}</option>
                    }
                  </select>
                </div>

                <div class="pro-form-group">
                  <label class="pro-label" for="editPartName">Part Name *</label>
                  <input
                    id="editPartName"
                    type="text"
                    class="pro-input"
                    formControlName="name"
                    placeholder="Enter part name"
                  />
                </div>

                <div class="pro-form-group">
                  <label class="pro-label" for="editPartDesc">Description</label>
                  <textarea
                    id="editPartDesc"
                    class="pro-input"
                    formControlName="description"
                    placeholder="Enter part description"
                    rows="3"
                  ></textarea>
                </div>

                <div class="pro-form-group" style="display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem;">
                  <input type="checkbox" id="editIsActive" formControlName="isActive" style="width: auto; margin: 0;" />
                  <label class="pro-label" for="editIsActive" style="margin: 0; cursor: pointer;">Is Active</label>
                </div>

                <div class="pro-form-group">
                  <label class="pro-label" for="editPartImage">Part Image</label>
                  <input
                    id="editPartImage"
                    type="file"
                    class="pro-input"
                    (change)="onFileSelected($event)"
                    accept="image/*"
                  />
                  <div class="pro-hint">Leave empty to keep existing image</div>
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

      <!-- Global Messages -->
      @if (successMessage) {
        <div class="success-alert animate-fade-in">{{ successMessage }}</div>
      }

      <!-- Parts List -->
      <div class="list-container">
        <div class="list-header">
          <h4 class="list-title">Available Product Parts</h4>
          <button class="refresh-btn" (click)="loadParts()" [disabled]="loadingList">
            {{ loadingList ? 'Loading...' : '↻ Refresh' }}
          </button>
        </div>

        @if (loadingList) {
          <div class="loading-state">Loading parts...</div>
        } @else if (parts.length === 0) {
          <div class="empty-state">No product parts found. Create your first part above.</div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Part Name</th>
                <th>Product</th>
                <th>Status</th>
                <th>Description</th>
                <th style="width: 180px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (part of parts; track part.id) {
                <tr>
                  <td class="id-cell">{{ part.id }}</td>
                  <td class="img-cell">
                    @if (part.partImage) {
                      <img [src]="getImageUrl(part.partImage)" alt="Part Image" class="part-thumbnail" />
                    } @else {
                      <div class="no-img-placeholder">No Image</div>
                    }
                  </td>
                  <td class="name-cell">{{ part.name }}</td>
                  <td class="product-cell">{{ getProductName(part.product) }}</td>
                  <td class="status-cell">
                    <span [class]="part.isActive ? 'status-active' : 'status-inactive'">
                      {{ part.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="desc-cell">{{ part.description || '—' }}</td>
                  <td class="actions-cell">
                    @if (deletingPartId === part.id) {
                      <div class="delete-confirm-box">
                        <span class="confirm-msg">Delete?</span>
                        <button class="btn-yes" (click)="onDelete(part.id!)">Yes</button>
                        <button class="btn-no" (click)="deletingPartId = null">No</button>
                      </div>
                    } @else {
                      <div class="action-btns">
                        <button class="btn-action-edit" (click)="startEdit(part)">Edit</button>
                        <button class="btn-action-delete" (click)="deletingPartId = part.id || null">Delete</button>
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

    .success-alert { padding: 0.75rem; background-color: #dcfce7; color: #166534; border-radius: 6px; font-size: 0.875rem; }
    .error-alert { padding: 0.75rem; background-color: #fee2e2; color: #991b1b; border-radius: 6px; margin-bottom: 1rem; font-size: 0.875rem; }

    .pro-form-group { margin-bottom: 1.25rem; }
    .pro-label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.5rem; }
    .pro-input { width: 100%; padding: 0.625rem 0.875rem; font-size: 0.95rem; color: var(--text-primary); background-color: var(--surface); border: 1px solid #cbd5e1; border-radius: 6px; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; font-family: inherit; }
    .pro-input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.15); }
    .pro-input.pro-invalid { border-color: #ef4444; }
    .pro-error { color: #ef4444; font-size: 0.825rem; margin-top: 0.375rem; }
    .pro-hint { color: #64748b; font-size: 0.8rem; margin-top: 0.25rem; }

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

    .actions-cell { vertical-align: middle; white-space: nowrap; }
    .action-btns { display: inline-flex; gap: 0.5rem; align-items: center; }
    .btn-action-edit { padding: 0.375rem 0.75rem; font-size: 0.825rem; font-weight: 600; border: 1px solid #cbd5e1; border-radius: 6px; background-color: var(--surface); color: #334155; cursor: pointer; transition: all 0.15s ease; }
    .btn-action-edit:hover { background-color: #f1f5f9; color: var(--text-primary); border-color: #94a3b8; }
    .btn-action-delete { padding: 0.375rem 0.75rem; font-size: 0.825rem; font-weight: 600; border: 1px solid #fee2e2; border-radius: 6px; background-color: var(--surface); color: #dc2626; cursor: pointer; transition: all 0.15s ease; }
    .btn-action-delete:hover { background-color: #fef2f2; color: #b91c1c; border-color: #fca5a5; }

    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 99999; padding: 1rem; box-sizing: border-box; }
    .modal-content { background-color: var(--surface); border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.1); width: 100%; max-width: 500px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--border); }
    .modal-content form { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }
    .modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-light); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
    .modal-title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0; }
    .modal-close { background: none; border: none; font-size: 1.5rem; font-weight: 500; color: var(--text-secondary); cursor: pointer; line-height: 1; }
    .modal-close:hover { color: var(--text-primary); }
    .modal-body { padding: 1.5rem; flex: 1; overflow-y: auto; }
    .modal-footer { padding: 1rem 1.5rem; background-color: var(--surface-2, #f8fafc); border-top: 1px solid var(--border-light); display: flex; justify-content: flex-end; gap: 0.75rem; flex-shrink: 0; }

    .btn-save { 
      padding: 0.5rem 1.25rem; 
      min-width: 90px;
      min-height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem; 
      font-weight: 700; 
      background-color: #10b981; 
      color: #ffffff !important; 
      border: none; 
      border-radius: 6px; 
      cursor: pointer; 
      transition: background-color 0.2s; 
      box-sizing: border-box;
    }
    .btn-save:hover { background-color: #059669; }
    .btn-save:disabled { background-color: #a7f3d0; cursor: not-allowed; opacity: 0.7; }
    .btn-cancel { 
      padding: 0.5rem 1.25rem; 
      min-width: 80px;
      min-height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem; 
      font-weight: 600; 
      background-color: #64748b; 
      color: #ffffff !important; 
      border: none; 
      border-radius: 6px; 
      cursor: pointer; 
      transition: background-color 0.2s; 
      box-sizing: border-box;
    }
    .btn-cancel:hover { background-color: #475569; }

    .delete-confirm-box { display: flex; align-items: center; gap: 0.5rem; background-color: #fef2f2; border: 1px solid #fee2e2; padding: 0.25rem 0.5rem; border-radius: 6px; }
    .confirm-msg { font-size: 0.825rem; font-weight: 600; color: #991b1b; }
    .btn-yes { padding: 0.25rem 0.5rem; font-size: 0.775rem; font-weight: 700; background-color: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .btn-yes:hover { background-color: #b91c1c; }
    .btn-no { padding: 0.25rem 0.5rem; font-size: 0.775rem; font-weight: 700; background-color: var(--text-secondary); color: white; border: none; border-radius: 4px; cursor: pointer; }
    .btn-no:hover { background-color: #475569; }

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
    .product-cell { color: #4f46e5; font-size: 0.875rem; }
    .status-cell { font-size: 0.8rem; font-weight: 600; }
    .status-active { color: #166534; background: #dcfce7; padding: 0.25rem 0.5rem; border-radius: 4px; }
    .status-inactive { color: #991b1b; background: #fee2e2; padding: 0.25rem 0.5rem; border-radius: 4px; }
    .desc-cell { color: var(--text-secondary); max-width: 250px; }
    
    .img-cell { width: 60px; text-align: center; }
    .part-thumbnail { width: 40px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border); }
    .no-img-placeholder { width: 40px; height: 40px; background: #f1f5f9; color: #94a3b8; font-size: 0.65rem; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: 1px dashed #cbd5e1; }

    .animate-fade-in { animation: fadeIn 0.25s ease-out; }
    .animate-slide-up { animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class ProductPartFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private partService = inject(ProductPartService);
  private productService = inject(ProductService);

  products: Product[] = [];
  parts: ProductPart[] = [];
  loadingList = false;

  partForm: FormGroup = this.fb.group({
    product: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    isActive: [true]
  });

  editForm: FormGroup = this.fb.group({
    product: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    isActive: [true]
  });

  isLoading = false;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  showCreateForm = false;
  editingPartId: number | null = null;
  deletingPartId: number | null = null;
  isUpdating = false;
  selectedFile: File | null = null;
  private messageTimer: any = null;

  get f() { return this.partForm.controls; }

  ngOnInit() {
    this.loadProducts();
    this.loadParts();
  }

  private parseArray(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.results)) return res.results;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (response: any) => { this.products = this.parseArray(response); },
      error: (err) => console.error(err)
    });
  }

  loadParts() {
    this.loadingList = true;
    this.partService.getProductParts().subscribe({
      next: (response: any) => {
        this.parts = this.parseArray(response);
        this.loadingList = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingList = false;
      }
    });
  }

  getProductName(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product ? product.name : `Product #${productId}`;
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    // If already a full URL, return as-is
    if (imagePath.startsWith('http')) return imagePath;
    // Otherwise prepend the base API URL
    return `${environment.apiUrl}${imagePath}`;
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';
    if (this.partForm.invalid) return;

    this.isLoading = true;
    
    const formData = new FormData();
    formData.append('product', this.partForm.value.product);
    formData.append('name', this.partForm.value.name);
    if (this.partForm.value.description) {
      formData.append('description', this.partForm.value.description);
    }
    formData.append('isActive', this.partForm.value.isActive);
    if (this.selectedFile) {
      formData.append('partImage', this.selectedFile);
    }

    this.partService.createProductPart(formData).subscribe({
      next: () => {
        this.showMessage('Product Part created successfully!');
        this.partForm.reset({ isActive: true });
        this.partForm.patchValue({ product: '' });
        this.selectedFile = null;
        this.submitted = false;
        this.isLoading = false;
        this.showCreateForm = false;
        this.loadParts();
      },
      error: (err: any) => {
        this.showMessage('', err.error?.message || 'Failed to create product part. Please try again.');
        this.isLoading = false;
      }
    });
  }

  startEdit(part: ProductPart) {
    this.editingPartId = part.id || null;
    this.deletingPartId = null;
    this.selectedFile = null;
    this.errorMessage = '';
    this.editForm.patchValue({
      product: part.product,
      name: part.name,
      description: part.description || '',
      isActive: part.isActive !== false
    });
  }

  cancelEdit() {
    this.editingPartId = null;
    this.selectedFile = null;
    this.editForm.reset();
  }

  onUpdate(id: number): void {
    if (this.editForm.invalid) return;
    this.isUpdating = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('product', this.editForm.value.product);
    formData.append('name', this.editForm.value.name);
    if (this.editForm.value.description) {
      formData.append('description', this.editForm.value.description);
    }
    formData.append('isActive', this.editForm.value.isActive);
    if (this.selectedFile) {
      formData.append('partImage', this.selectedFile);
    }

    this.partService.updateProductPart(id, formData).subscribe({
      next: () => {
        this.showMessage('Product Part updated successfully!');
        this.editingPartId = null;
        this.selectedFile = null;
        this.editForm.reset();
        this.isUpdating = false;
        this.loadParts();
      },
      error: (err: any) => {
        this.showMessage('', err.error?.message || 'Failed to update product part.');
        this.isUpdating = false;
      }
    });
  }

  onDelete(id: number): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.partService.deleteProductPart(id).subscribe({
      next: () => {
        this.showMessage('Product Part deleted successfully!');
        this.deletingPartId = null;
        this.loadParts();
      },
      error: (err: any) => {
        this.showMessage('', err.error?.message || 'Failed to delete product part.');
        this.deletingPartId = null;
      }
    });
  }
}
