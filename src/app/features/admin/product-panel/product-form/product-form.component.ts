import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { BrandService } from '../../../../core/services/brand.service';
import { Brand } from '../../../../core/models/brand.model';
import { Product } from '../../../../core/models/product.model';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SlicePipe],
  template: `
    <div class="panel-section animate-fade-in">
      @if (authService.getRole() !== 'Customer') {
        <div class="create-toggle-container">
          <button class="create-toggle-btn" (click)="showCreateForm = true">
            <span class="plus-icon">+</span>
            <span>Create New Product</span>
          </button>
        </div>
      }

      <!-- Create Modal -->
      @if (showCreateForm) {
        <div class="modal-backdrop animate-fade-in" (click)="showCreateForm = false">
          <div class="modal-content animate-slide-up" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Create Product</h3>
              <button class="modal-close" (click)="showCreateForm = false">&times;</button>
            </div>
            <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
              <div class="modal-body">
                @if (errorMessage && !editingProductId) {
                  <div class="error-alert">{{ errorMessage }}</div>
                }

                <div class="pro-form-group">
                  <label class="pro-label" for="brandSelect">Brand *</label>
                  <select 
                    id="brandSelect" 
                    class="pro-input" 
                    [ngClass]="{'pro-invalid': submitted && f['brand'].errors}"
                    formControlName="brand"
                  >
                    <option value="" disabled selected>Select a brand...</option>
                    @for (brand of brands; track brand.id) {
                      <option [value]="brand.id">{{ brand.name }}</option>
                    }
                  </select>
                  @if (submitted && f['brand'].errors?.['required']) {
                    <div class="pro-error">Brand selection is required</div>
                  }
                </div>

                <div class="pro-form-group">
                  <label class="pro-label" for="productName">Product Name *</label>
                  <input 
                    id="productName" 
                    type="text" 
                    class="pro-input" 
                    [ngClass]="{'pro-invalid': submitted && f['name'].errors}"
                    formControlName="name" 
                    placeholder="Enter product name"
                  />
                  @if (submitted && f['name'].errors?.['required']) {
                    <div class="pro-error">Product name is required</div>
                  }
                </div>

                <div class="pro-form-group">
                  <label class="pro-label" for="productCode">Product Code</label>
                  <input 
                    id="productCode" 
                    type="text" 
                    class="pro-input" 
                    formControlName="productCode" 
                    placeholder="Enter unique product code"
                  />
                </div>

                <div class="pro-form-group">
                  <label class="pro-label" for="productDesc">Description</label>
                  <textarea 
                    id="productDesc" 
                    class="pro-input" 
                    formControlName="description" 
                    placeholder="Enter product description"
                    rows="3"
                  ></textarea>
                </div>

                <div class="pro-form-group">
                  <label class="pro-label">Product Image</label>
                  <div class="image-upload-zone" (click)="createFileInput.click()" [class.has-preview]="imagePreview">
                    <input type="file" #createFileInput class="hidden-input" (change)="onFileChange($event, false)" accept="image/*" />
                    @if (imagePreview) {
                      <img [src]="imagePreview" class="image-preview" />
                      <div class="image-change-label">Click to change</div>
                    } @else {
                      <div class="upload-placeholder">
                        <span class="upload-icon">📷</span>
                        <span class="upload-text">Click to upload image</span>
                        <span class="upload-hint">PNG, JPG up to 5MB</span>
                      </div>
                    }
                  </div>
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
      @if (editingProductId !== null) {
        <div class="modal-backdrop animate-fade-in" (click)="cancelEdit()">
          <div class="modal-content animate-slide-up" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Edit Product</h3>
              <button class="modal-close" (click)="cancelEdit()">&times;</button>
            </div>
            <form [formGroup]="editForm" (ngSubmit)="onUpdate(editingProductId)">
              <div class="modal-body">
                @if (errorMessage && editingProductId) {
                  <div class="error-alert">{{ errorMessage }}</div>
                }

                <div class="pro-form-group">
                  <label class="pro-label" for="editProductBrand">Brand *</label>
                  <select id="editProductBrand" class="pro-input" formControlName="brand">
                    <option value="" disabled>Select a brand...</option>
                    @for (b of brands; track b.id) {
                      <option [value]="b.id">{{ b.name }}</option>
                    }
                  </select>
                </div>

                <div class="pro-form-group">
                  <label class="pro-label" for="editProductName">Product Name *</label>
                  <input 
                    id="editProductName" 
                    type="text" 
                    class="pro-input" 
                    formControlName="name" 
                    placeholder="Enter product name"
                  />
                </div>

                <div class="pro-form-group">
                  <label class="pro-label" for="editProductCode">Product Code</label>
                  <input 
                    id="editProductCode" 
                    type="text" 
                    class="pro-input" 
                    formControlName="productCode" 
                    placeholder="Enter product code"
                  />
                </div>

                <div class="pro-form-group">
                  <label class="pro-label" for="editProductDesc">Description</label>
                  <textarea 
                    id="editProductDesc" 
                    class="pro-input" 
                    formControlName="description" 
                    placeholder="Enter product description"
                    rows="3"
                  ></textarea>
                </div>

                <div class="pro-form-group">
                  <label class="pro-label">Product Image</label>
                  <div class="image-upload-zone" (click)="editFileInput.click()" [class.has-preview]="editImagePreview">
                    <input type="file" #editFileInput class="hidden-input" (change)="onFileChange($event, true)" accept="image/*" />
                    @if (editImagePreview) {
                      <img [src]="editImagePreview" class="image-preview" />
                      <div class="image-change-label">Click to change</div>
                    } @else {
                      <div class="upload-placeholder">
                        <span class="upload-icon">📷</span>
                        <span class="upload-text">Click to upload image</span>
                        <span class="upload-hint">PNG, JPG up to 5MB</span>
                      </div>
                    }
                  </div>
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

      <!-- Products List -->
      <div class="list-container">
        <div class="list-header">
          <h4 class="list-title">Available Products</h4>
          <button class="refresh-btn" (click)="loadProducts()" [disabled]="loadingList">
            {{ loadingList ? 'Loading...' : '↻ Refresh' }}
          </button>
        </div>

        @if (loadingList) {
          <div class="loading-state">Loading products...</div>
        } @else if (products.length === 0) {
          <div class="empty-state">No products found. Create your first product above.</div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 60px;">Image</th>
                <th>Product Name</th>
                <th>Brand</th>
                <th>Code</th>
                <th>Description</th>
                @if (authService.getRole() !== 'Customer') {
                  <th style="width: 180px;">Actions</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (product of products; track product.id) {
                <tr>
                  <td class="img-cell">
                    @if (product.productImage || product.product_image) {
                      <img [src]="getImageUrl((product.productImage || product.product_image)!)" alt="Product" class="list-thumbnail" />
                    } @else {
                      <div class="no-image-placeholder">📦</div>
                    }
                  </td>
                  <td class="name-cell">{{ product.name }}</td>
                  <td class="brand-cell">{{ getBrandName(product.brand) }}</td>
                  <td class="code-cell">{{ product.productCode || product.product_code || '—' }}</td>
                  <td class="desc-cell" [title]="product.description || ''">
                    {{ (product.description && product.description.length > 40) ? (product.description | slice:0:40) + '...' : (product.description || '—') }}
                  </td>
                  @if (authService.getRole() !== 'Customer') {
                    <td class="actions-cell">
                      @if (deletingProductId === product.id) {
                        <div class="delete-confirm-box">
                          <span class="confirm-msg">Delete?</span>
                          <button class="btn-yes" (click)="onDelete(product.id!)">Yes</button>
                          <button class="btn-no" (click)="deletingProductId = product.id || null">No</button>
                        </div>
                      } @else {
                        <div class="action-btns">
                          <button class="btn-action-edit" (click)="startEdit(product)">Edit</button>
                          <button class="btn-action-delete" (click)="deletingProductId = product.id || null">Delete</button>
                        </div>
                      }
                    </td>
                  }
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
    .data-table td { padding: 0.875rem 1rem; font-size: 0.9rem; color: #334155; border-bottom: 1px solid var(--border-light); vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: rgba(248,250,252,0.5); }
    .name-cell { font-weight: 500; color: var(--text-primary); }
    .brand-cell { color: #4f46e5; font-size: 0.875rem; }
    .code-cell { color: var(--text-secondary); font-family: monospace; font-size: 0.875rem; }
    .desc-cell { color: #64748b; font-size: 0.85rem; max-width: 180px; cursor: help; }

    /* Image cells */
    .img-cell { width: 60px; }
    .list-thumbnail { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; border: 1px solid #e2e8f0; }
    .no-image-placeholder { width: 40px; height: 40px; border-radius: 6px; background: #f1f5f9; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 1rem; }

    /* Image upload */
    .hidden-input { display: none; }
    .image-upload-zone { border: 2px dashed #cbd5e1; border-radius: 8px; background: #f8fafc; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; min-height: 120px; display: flex; align-items: center; justify-content: center; }
    .image-upload-zone:hover { border-color: #4f46e5; background: #f5f3ff; }
    .image-upload-zone.has-preview { border-style: solid; border-color: #e2e8f0; background: white; }
    .image-preview { max-width: 100%; max-height: 150px; object-fit: contain; display: block; margin: 0 auto; }
    .image-change-label { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.5); color: white; text-align: center; font-size: 0.75rem; padding: 0.35rem; opacity: 0; transition: opacity 0.2s; }
    .image-upload-zone:hover .image-change-label { opacity: 1; }
    .upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 1.5rem; }
    .upload-icon { font-size: 1.5rem; }
    .upload-text { font-size: 0.85rem; font-weight: 500; color: #334155; }
    .upload-hint { font-size: 0.75rem; color: #94a3b8; }

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
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private brandService = inject(BrandService);
  public authService = inject(AuthService);

  brands: Brand[] = [];
  products: Product[] = [];
  loadingList = false;
  apiUrl = environment.apiUrl;

  imagePreview: string | ArrayBuffer | null = null;
  editImagePreview: string | ArrayBuffer | null = null;

  productForm: FormGroup = this.fb.group({
    brand: ['', Validators.required],
    name: ['', Validators.required],
    productCode: [''],
    description: [''],
    productImage: [null]
  });

  editForm: FormGroup = this.fb.group({
    brand: ['', Validators.required],
    name: ['', Validators.required],
    productCode: [''],
    description: [''],
    productImage: [null]
  });

  isLoading = false;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  private messageTimer: any = null;

  showCreateForm = false;
  editingProductId: number | null = null;
  deletingProductId: number | null = null;
  isUpdating = false;

  get f() { return this.productForm.controls; }

  ngOnInit() {
    this.loadBrands();
    this.loadProducts();
  }

  private parseArray(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.results)) return res.results;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  }

  loadBrands() {
    this.brandService.getBrands().subscribe({
      next: (response: any) => {
        this.brands = this.parseArray(response);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadProducts() {
    this.loadingList = true;

    this.productService.getProducts().subscribe({
      next: (response: any) => {
        this.products = this.parseArray(response);
        this.loadingList = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingList = false;
      }
    });
  }

  getBrandName(brandId: number): string {
    const brand = this.brands.find(b => b.id == brandId);
    return brand ? brand.name : `Brand #${brandId}`;
  }

  onFileChange(event: any, isEdit: boolean) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (isEdit) {
        this.editImagePreview = reader.result;
        this.editForm.patchValue({ productImage: file });
      } else {
        this.imagePreview = reader.result;
        this.productForm.patchValue({ productImage: file });
      }
    };
    reader.readAsDataURL(file);
  }

  getImageUrl(path: string | File | null | undefined): string {
    if (!path || path instanceof File) return '';
    if (path.startsWith('http')) return path;
    return `${this.apiUrl}${path}`;
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

    if (this.productForm.invalid) return;

    this.isLoading = true;
    const payload = { ...this.productForm.value, brand: Number(this.productForm.value.brand) };

    this.productService.createProduct(payload).subscribe({
      next: () => {
        this.showMessage('Product created successfully!');
        this.productForm.reset();
        this.productForm.patchValue({ brand: '' });
        this.imagePreview = null;
        this.submitted = false;
        this.isLoading = false;
        this.showCreateForm = false;
        this.loadProducts();
      },
      error: (err: any) => {
        let msg = 'Failed to create product. Please try again.';
        if (err.error) {
          if (typeof err.error === 'string') {
            msg = err.error;
          } else if (typeof err.error === 'object') {
            // Flatten field errors: { product_image: ['This field is required.'] }
            const fieldErrors = Object.entries(err.error)
              .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
              .join(' | ');
            msg = fieldErrors || msg;
          }
        }
        this.showMessage('', msg);
        this.isLoading = false;
      }
    });
  }

  startEdit(product: Product) {
    this.editingProductId = product.id || null;
    this.deletingProductId = null;
    this.errorMessage = '';
    this.editForm.patchValue({
      brand: product.brand,
      name: product.name,
      productCode: product.productCode || product.product_code || '',
      description: product.description || '',
      productImage: null
    });
    this.editImagePreview = this.getImageUrl(product.productImage || product.product_image);
  }

  cancelEdit() {
    this.editingProductId = null;
    this.editForm.reset();
    this.editImagePreview = null;
  }

  onUpdate(id: number): void {
    if (this.editForm.invalid) return;

    this.isUpdating = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = { ...this.editForm.value, brand: Number(this.editForm.value.brand) };

    this.productService.updateProduct(id, payload).subscribe({
      next: () => {
        this.showMessage('Product updated successfully!');
        this.editingProductId = null;
        this.editForm.reset();
        this.editImagePreview = null;
        this.isUpdating = false;
        this.loadProducts();
      },
      error: (err: any) => {
        let msg = 'Failed to update product. Please try again.';
        if (err.error) {
          if (typeof err.error === 'string') {
            msg = err.error;
          } else if (typeof err.error === 'object') {
            const fieldErrors = Object.entries(err.error)
              .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
              .join(' | ');
            msg = fieldErrors || msg;
          }
        }
        this.showMessage('', msg);
        this.isUpdating = false;
      }
    });
  }

  onDelete(id: number): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.showMessage('Product deleted successfully!');
        this.deletingProductId = null;
        this.loadProducts();
      },
      error: (err: any) => {
        this.showMessage('', err.error?.message || 'Failed to delete product.');
        this.deletingProductId = null;
      }
    });
  }
}
