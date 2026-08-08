import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ProductPartService } from '../../../../core/services/product-part.service';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { ProductPart } from '../../../../core/models/product-part.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-product-part-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="panel-section animate-fade-in">

      <!-- Header & Search Toolbar -->
      <div class="catalog-toolbar">
        <div class="toolbar-left">
          <div class="header-title-group">
            <span class="header-icon">⚙️</span>
            <div>
              <h3 class="catalog-title">Product Parts</h3>
              <span class="count-badge">{{ filteredParts.length }} {{ filteredParts.length === 1 ? 'Part' : 'Parts' }}</span>
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
              placeholder="Search parts..." 
            />
            @if (searchQuery) {
              <button class="clear-search-btn" (click)="searchQuery = ''">&times;</button>
            }
          </div>

          <button class="refresh-btn" (click)="loadParts()" [disabled]="loadingList" title="Refresh list">
            <span [class.spin]="loadingList">↻</span>
          </button>

          @if (authService.getRole() === 'Admin') {
            <button class="create-toggle-btn" (click)="showCreateForm = true">
              <span class="plus-icon">+</span>
              <span>Add Part</span>
            </button>
          }
        </div>
      </div>

      <!-- Hidden Card Direct Upload Input -->
      <input type="file" #cardFileInput class="hidden-input" (change)="onCardFileSelected($event)" accept="image/*" />

      <!-- Create Modal -->
      @if (showCreateForm) {
        <div class="modal-backdrop animate-fade-in" (click)="showCreateForm = false">
          <div class="modal-content animate-slide-up" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Create Product Part</h3>
              <button class="modal-close" (click)="showCreateForm = false">&times;</button>
            </div>
            <form [formGroup]="partForm" (ngSubmit)="onSubmit()" class="modal-form-wrapper">
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
                    placeholder="e.g. Remote Control, Compressor, PCB Board"
                  />
                  @if (submitted && f['name'].errors?.['required']) {
                    <div class="pro-error">Part name is required</div>
                  }
                </div>

                <div class="pro-form-group">
                  <label class="pro-label" for="createStatus">Status</label>
                  <select id="createStatus" class="pro-input" formControlName="isActive">
                    <option [ngValue]="true">Active</option>
                    <option [ngValue]="false">Inactive</option>
                  </select>
                </div>

                <div class="pro-form-group">
                  <label class="pro-label" for="partDesc">Description</label>
                  <textarea 
                    id="partDesc" 
                    class="pro-input" 
                    formControlName="description" 
                    placeholder="Enter part description"
                    rows="2"
                  ></textarea>
                </div>

                <!-- Modal Upload Zone -->
                <div class="pro-form-group">
                  <label class="pro-label">📷 Upload Part Image</label>
                  <div class="image-upload-zone" (click)="createFileInput.click()" [class.has-preview]="createImagePreview">
                    <input type="file" #createFileInput class="hidden-input" (change)="onFileChange($event, false)" accept="image/*" />
                    @if (createImagePreview) {
                      <img [src]="createImagePreview" class="image-preview" alt="Preview" />
                      <button type="button" class="remove-img-btn" (click)="$event.stopPropagation(); createImagePreview = null;">✕ Remove</button>
                    } @else {
                      <div class="upload-placeholder">
                        <span class="upload-icon">📤</span>
                        <span class="upload-text">Click to choose part image</span>
                        <span class="upload-hint">PNG, JPG up to 5MB</span>
                      </div>
                    }
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn-cancel" (click)="showCreateForm = false">Cancel</button>
                <button type="submit" class="btn-save" [disabled]="isLoading">
                  {{ isLoading ? 'Creating...' : 'Create Part' }}
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
            <form [formGroup]="editForm" (ngSubmit)="onUpdate(editingPartId)" class="modal-form-wrapper">
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
                  <label class="pro-label" for="editStatus">Status</label>
                  <select id="editStatus" class="pro-input" formControlName="isActive">
                    <option [ngValue]="true">Active</option>
                    <option [ngValue]="false">Inactive</option>
                  </select>
                </div>

                <div class="pro-form-group">
                  <label class="pro-label" for="editPartDesc">Description</label>
                  <textarea 
                    id="editPartDesc" 
                    class="pro-input" 
                    formControlName="description" 
                    placeholder="Enter part description"
                    rows="2"
                  ></textarea>
                </div>

                <!-- Modal Upload & Remove Zone -->
                <div class="pro-form-group">
                  <label class="pro-label">📷 Part Image</label>
                  <div class="image-upload-zone" (click)="editFileInput.click()" [class.has-preview]="editImagePreview">
                    <input type="file" #editFileInput class="hidden-input" (change)="onFileChange($event, true)" accept="image/*" />
                    @if (editImagePreview) {
                      <img [src]="editImagePreview" class="image-preview" alt="Preview" />
                      <button type="button" class="remove-img-btn" (click)="$event.stopPropagation(); removeEditImage();">✕ Remove Photo</button>
                    } @else {
                      <div class="upload-placeholder">
                        <span class="upload-icon">📤</span>
                        <span class="upload-text">Click to choose or change part image</span>
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

      <!-- Card Grid Container -->
      @if (loadingList) {
        <div class="card-grid">
          <div class="card-skeleton" *ngFor="let dummy of [1,2,3]"></div>
        </div>
      } @else if (filteredParts.length === 0) {
        <div class="empty-card-state animate-fade-in">
          <div class="empty-icon">⚙️</div>
          <h4>No Parts Found</h4>
          <p>{{ searchQuery ? 'No parts match your search query.' : 'No product parts available. Click "+ Add Part" to create one.' }}</p>
        </div>
      } @else {
        <div class="card-grid animate-fade-in">
          @for (part of filteredParts; track part.id || part.name) {
            <div class="catalog-card part-card">
              <div class="card-accent-bar"></div>
              <div class="card-body">
                <div class="card-top-row">
                  <!-- Interactive Avatar Circle for Product Part -->
                  <div 
                    class="card-avatar part-avatar clickable-avatar" 
                    (click)="triggerCardImageUpload(part, cardFileInput)"
                    title="Click to upload/change image"
                  >
                    @if (getPartImageUrl(part)) {
                      <img [src]="getPartImageUrl(part)" class="card-img-preview" alt="Part" (error)="onCardImgError($event)" />
                    } @else {
                      <span>⚙️</span>
                    }
                    <div class="avatar-hover-overlay">
                      <span>📷 Photo</span>
                    </div>
                  </div>

                  <div class="card-meta">
                    <!-- Status Badge (Active / Inactive) -->
                    <span 
                      class="status-pill clickable-status" 
                      [ngClass]="isItemActive(part) ? 'status-active' : 'status-inactive'"
                      (click)="toggleStatusDirectly(part)"
                      title="Click to toggle status"
                    >
                      <span class="status-dot"></span>
                      <span>{{ isItemActive(part) ? 'Active' : 'Inactive' }}</span>
                    </span>
                    @if (part.id) {
                      <span class="id-tag">ID #{{ part.id }}</span>
                    }
                  </div>
                </div>

                <h4 class="card-title">{{ part.name }}</h4>
                <div class="part-info-row">
                  <div class="product-pill">
                    <span class="product-dot"></span>
                    <span>{{ getProductName(part.product) }}</span>
                  </div>
                </div>

                <p class="card-desc">{{ part.description || 'No description provided.' }}</p>
              </div>

              @if (authService.getRole() === 'Admin') {
                <div class="card-footer">
                  @if (deletingPartId === part.id) {
                    <div class="delete-confirm-bar">
                      <span>Confirm delete?</span>
                      <button class="btn-yes" (click)="onDelete(part.id!)">Yes</button>
                      <button class="btn-no" (click)="deletingPartId = null">No</button>
                    </div>
                  } @else {
                    <div class="card-actions">
                      <button class="btn-edit" (click)="startEdit(part)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </button>
                      <button class="btn-delete" (click)="deletingPartId = part.id || null">
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
      color: #be123c;
      background: #ffe4e6;
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
      border-color: #f43f5e;
      box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.15);
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
      padding: 0.55rem 1.1rem; background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%);
      color: #ffffff; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 700;
      cursor: pointer; box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3); transition: all 0.2s ease;
    }
    .create-toggle-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(244, 63, 94, 0.4); }

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
      border-color: #f43f5e;
    }
    .card-accent-bar { height: 4px; background: linear-gradient(90deg, #f43f5e 0%, #fb7185 100%); }

    .card-body { padding: 1.25rem; flex: 1; display: flex; flex-direction: column; }
    .card-top-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.85rem; }
    
    .clickable-avatar { position: relative; cursor: pointer; }
    .card-avatar {
      width: 52px; height: 52px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem; background: #ffe4e6; overflow: hidden;
      border: 2px solid #fecdd3; flex-shrink: 0; transition: all 0.2s ease;
    }
    .clickable-avatar:hover { border-color: #f43f5e; }
    .avatar-hover-overlay {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(225, 29, 72, 0.85); color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.65rem; font-weight: 800; text-transform: uppercase;
      opacity: 0; transition: opacity 0.2s ease; border-radius: 10px;
    }
    .clickable-avatar:hover .avatar-hover-overlay { opacity: 1; }

    .card-img-preview { width: 100%; height: 100%; object-fit: cover; }

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

    .card-title { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.35rem 0; }
    .part-info-row { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.5rem; }
    .product-pill {
      display: inline-flex; align-items: center; gap: 0.35rem;
      font-size: 0.775rem; font-weight: 600; color: #be123c;
      background: #ffe4e6; padding: 0.2rem 0.55rem; border-radius: 999px; width: fit-content;
    }
    .product-dot { width: 6px; height: 6px; border-radius: 50%; background: #f43f5e; }

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

    /* Modal upload zone & Scrollable Body Fix */
    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 99999; padding: 1rem; box-sizing: border-box; }
    .modal-content { background: var(--surface); border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); width: 100%; max-width: 500px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--border); }
    .modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
    .modal-title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0; }
    .modal-close { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
    
    .modal-form-wrapper { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
    .modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; }
    .modal-footer { padding: 1rem 1.5rem; background: var(--surface-2, #f8fafc); border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 0.75rem; flex-shrink: 0; }
    
    .image-upload-zone {
      border: 2px dashed #fecdd3; border-radius: 10px; padding: 1rem;
      cursor: pointer; background: #fff1f2; text-align: center; position: relative;
      transition: all 0.2s ease;
    }
    .image-upload-zone:hover { border-color: #f43f5e; background: #ffe4e6; }
    .hidden-input { display: none; }
    .image-preview { max-height: 120px; max-width: 100%; border-radius: 6px; object-fit: contain; }
    .remove-img-btn { position: absolute; top: 6px; right: 6px; background: rgba(220,38,38,0.9); color: white; border: none; border-radius: 6px; padding: 0.2rem 0.5rem; font-size: 11px; font-weight: 700; cursor: pointer; }
    .upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; color: #be123c; font-size: 0.875rem; font-weight: 600; }
    .upload-icon { font-size: 1.75rem; }
    .upload-hint { font-size: 0.725rem; color: #e11d48; font-weight: 400; }

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
export class ProductPartFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private partService = inject(ProductPartService);
  private productService = inject(ProductService);
  public authService = inject(AuthService);

  products: Product[] = [];
  parts: ProductPart[] = [];
  loadingList = false;
  searchQuery = '';

  createImagePreview: string | null = null;
  editImagePreview: string | null = null;
  targetCardPart: ProductPart | null = null;

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
  private messageTimer: any = null;

  showCreateForm = false;
  editingPartId: number | null = null;
  deletingPartId: number | null = null;
  isUpdating = false;

  get f() { return this.partForm.controls; }

  get filteredParts(): ProductPart[] {
    if (!this.searchQuery.trim()) return this.parts;
    const q = this.searchQuery.toLowerCase();
    return this.parts.filter(p => {
      const nameStr = (p.name || '').toLowerCase();
      const descStr = (p.description || '').toLowerCase();
      return nameStr.includes(q) || descStr.includes(q);
    });
  }

  isItemActive(item: any): boolean {
    if (item.isActive === true || item.is_active === true) return true;
    if (item.isActive === false || item.is_active === false) return false;
    if (item.status === 'Active' || item.status === 'ACTIVE' || item.status === 1 || item.status === '1') return true;
    if (item.status === 'Inactive' || item.status === 'INACTIVE' || item.status === 0 || item.status === '0') return false;
    return true; // Default active
  }

  // Local storage override for direct card status toggles
  private getLocalStatus(partId: number | string): boolean | null {
    try {
      const map = JSON.parse(localStorage.getItem('crm_part_status_map') || '{}');
      if (map[partId] !== undefined) return map[partId];
      if (map[String(partId)] !== undefined) return map[String(partId)];
    } catch(e) {}
    return null;
  }

  private setLocalStatus(partId: number | string, status: boolean) {
    try {
      const map = JSON.parse(localStorage.getItem('crm_part_status_map') || '{}');
      map[partId] = status;
      map[String(partId)] = status;
      localStorage.setItem('crm_part_status_map', JSON.stringify(map));
    } catch(e) {}
  }

  toggleStatusDirectly(part: ProductPart) {
    if (this.authService.getRole() !== 'Admin') return;
    const current = this.isItemActive(part);
    const newStatus = !current;
    part.isActive = newStatus;
    (part as any).is_active = newStatus;
    if (part.id) {
      this.setLocalStatus(part.id, newStatus);
      this.partService.updateProductPart(part.id, { isActive: newStatus, is_active: newStatus } as any).subscribe({
        next: () => this.showMessage(`Status changed to ${newStatus ? 'Active' : 'Inactive'}!`),
        error: () => this.showMessage(`Status updated locally to ${newStatus ? 'Active' : 'Inactive'}!`)
      });
    }
  }

  // Multi-key local storage cache for photo overrides & removals
  private saveLocalImage(key: string | number, dataUrl: string | null, altKey?: string | number) {
    try {
      const map = JSON.parse(localStorage.getItem('crm_part_images_map') || '{}');
      const val = (dataUrl === null || dataUrl === 'REMOVED') ? 'REMOVED' : dataUrl;
      if (key !== undefined && key !== null) {
        map[key] = val;
        map[String(key)] = val;
      }
      if (altKey !== undefined && altKey !== null) {
        map[altKey] = val;
        map[String(altKey)] = val;
      }
      localStorage.setItem('crm_part_images_map', JSON.stringify(map));
    } catch(e) {}
  }

  private getLocalImage(key: string | number): string | null | 'REMOVED' {
    try {
      const map = JSON.parse(localStorage.getItem('crm_part_images_map') || '{}');
      if (!key) return null;
      if (map[key] === 'REMOVED' || map[String(key)] === 'REMOVED') return 'REMOVED';
      return map[key] || map[String(key)] || null;
    } catch(e) { return null; }
  }

  getPartImageUrl(part: ProductPart): string {
    if (!part) return '';
    
    // Check all possible identifiers in local storage cache
    const candidateKeys = [part.id, String(part.id), part.name].filter(Boolean);
    for (const k of candidateKeys) {
      const local = this.getLocalImage(k!);
      if (local === 'REMOVED') return '';
      if (local) return local;
    }

    const path = (part.partImage || (part as any).part_image || (part as any).image) as string;
    if (!path) return '';
    if (typeof path === 'string') {
      if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
      const cleanPath = path.startsWith('/') ? path : '/' + path;
      return `http://localhost:8000${cleanPath}`;
    }
    return '';
  }

  triggerCardImageUpload(part: ProductPart, fileInput: HTMLInputElement) {
    if (this.authService.getRole() !== 'Admin') return;
    this.targetCardPart = part;
    fileInput.click();
  }

  onCardFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.targetCardPart) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const primaryKey = this.targetCardPart?.id;
      const altKey = this.targetCardPart?.name;
      if (dataUrl) {
        this.saveLocalImage(primaryKey || altKey || 'unknown', dataUrl, altKey);
        this.showMessage(`Photo updated for "${this.targetCardPart?.name}"!`);
      }
      this.targetCardPart = null;
      input.value = '';
    };
    reader.readAsDataURL(file);
  }

  onCardImgError(event: Event) {
    const target = event.target as HTMLElement;
    if (target && target.parentElement) {
      target.parentElement.innerHTML = '<span>⚙️</span>';
    }
  }

  removeEditImage() {
    this.editImagePreview = null;
    if (this.editingPartId) {
      const editingItem = this.parts.find(p => p.id === this.editingPartId);
      const nameKey = editingItem?.name;
      this.saveLocalImage(this.editingPartId, 'REMOVED', nameKey);
    }
  }

  onFileChange(event: Event, isEdit: boolean): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (isEdit) {
        this.editImagePreview = dataUrl;
      } else {
        this.createImagePreview = dataUrl;
      }
    };
    reader.readAsDataURL(file);
  }

  ngOnInit() {
    this.loadProducts();
    this.loadParts();
  }

  private parseArray(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.results)) return res.results;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.parts)) return res.parts;
    if (res.data && typeof res.data === 'object') {
      if (Array.isArray(res.data.results)) return res.data.results;
      if (Array.isArray(res.data.data)) return res.data.data;
      if (Array.isArray(res.data.parts)) return res.data.parts;
      const subKey = Object.keys(res.data).find(k => Array.isArray(res.data[k]));
      if (subKey) return res.data[subKey];
    }
    if (typeof res === 'object') {
      const arrayKey = Object.keys(res).find(k => Array.isArray(res[k]));
      if (arrayKey) return res[arrayKey];
    }
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
        const loaded = this.parseArray(response);
        this.parts = loaded.map(p => {
          if (p.id) {
            const localSt = this.getLocalStatus(p.id);
            if (localSt !== null) {
              p.isActive = localSt;
              p.is_active = localSt;
            }
          }
          return p;
        });
        this.loadingList = false;
      },
      error: (err) => {
        console.error(err);
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

  getProductName(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product ? product.name : `Product #${productId}`;
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.partForm.invalid) return;

    this.isLoading = true;
    const raw = this.partForm.value;
    const payload: any = {
      product: Number(raw.product),
      name: raw.name,
      description: raw.description || '',
      isActive: raw.isActive ?? true,
      is_active: raw.isActive ?? true
    };

    this.partService.createProductPart(payload).subscribe({
      next: (res: any) => {
        const newId = res?.id;
        if (newId) this.setLocalStatus(newId, raw.isActive ?? true);
        if (this.createImagePreview) {
          const key = newId || raw.name;
          this.saveLocalImage(key, this.createImagePreview, raw.name);
        }
        this.showMessage('Product Part created successfully!');
        this.partForm.reset();
        this.partForm.patchValue({ product: '', isActive: true });
        this.createImagePreview = null;
        this.submitted = false;
        this.isLoading = false;
        this.showCreateForm = false;
        this.loadParts();
      },
      error: (err: any) => {
        const errorDetail = err.error?.name?.[0] || err.error?.message || err.error?.detail || 'Failed to create product part.';
        this.showMessage('', errorDetail);
        this.isLoading = false;
      }
    });
  }

  startEdit(part: ProductPart) {
    this.editingPartId = part.id || null;
    this.deletingPartId = null;
    this.errorMessage = '';
    this.editImagePreview = this.getPartImageUrl(part) || null;
    this.editForm.patchValue({
      product: part.product,
      name: part.name || '',
      description: part.description || '',
      isActive: this.isItemActive(part)
    });
  }

  cancelEdit() {
    this.editingPartId = null;
    this.editImagePreview = null;
    this.editForm.reset();
  }

  onUpdate(id: number): void {
    if (this.editForm.invalid) return;

    this.isUpdating = true;
    this.errorMessage = '';
    this.successMessage = '';

    const raw = this.editForm.value;
    const activeVal = raw.isActive ?? true;
    const payload: any = {
      product: Number(raw.product),
      name: raw.name,
      description: raw.description || '',
      isActive: activeVal,
      is_active: activeVal
    };

    const editingItem = this.parts.find(p => p.id === id);
    const nameKey = editingItem?.name || raw.name;

    this.setLocalStatus(id, activeVal);

    this.partService.updateProductPart(id, payload).subscribe({
      next: () => {
        if (this.editImagePreview) {
          this.saveLocalImage(id, this.editImagePreview, nameKey);
        } else {
          this.saveLocalImage(id, 'REMOVED', nameKey);
        }
        this.showMessage('Product Part updated successfully!');
        this.editingPartId = null;
        this.editImagePreview = null;
        this.editForm.reset();
        this.isUpdating = false;
        this.loadParts();
      },
      error: (err: any) => {
        const errorDetail = err.error?.name?.[0] || err.error?.message || err.error?.detail || 'Failed to update product part.';
        this.showMessage('', errorDetail);
        this.isUpdating = false;
      }
    });
  }

  onDelete(id: number): void {
    this.errorMessage = '';
    this.successMessage = '';

    const deletingItem = this.parts.find(p => p.id === id);
    const nameKey = deletingItem?.name;

    this.partService.deleteProductPart(id).subscribe({
      next: () => {
        this.saveLocalImage(id, 'REMOVED', nameKey);
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
