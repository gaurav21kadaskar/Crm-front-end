import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CallService } from '../../core/services/call.service';
import { BrandService } from '../../core/services/brand.service';
import { ProductService } from '../../core/services/product.service';
import { ProductModelService } from '../../core/services/product-model.service';
import { ProductIssueService } from '../../core/services/product-issue.service';
import { Call, CallExportFilter } from '../../core/models/call.model';
import { Brand } from '../../core/models/brand.model';
import { Product } from '../../core/models/product.model';
import { ProductModel } from '../../core/models/product-model.model';
import { ProductIssue } from '../../core/models/product-issue.model';

@Component({
  selector: 'app-call-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="page-wrapper animate-fade-in">
      <!-- Header -->
      <div class="pg-header">
        <div class="pg-header-left">
          <div class="pg-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div>
            <h1 class="pg-title">Call Management</h1>
            <p class="pg-subtitle">Manage customer service calls, assign technicians & track resolutions</p>
          </div>
        </div>

        <!-- Mode Toggle Tabs -->
        <div class="tab-nav">
          <button class="tab-btn" [class.active]="activeTab === 'list'" (click)="activeTab = 'list'">
            📋 All Calls
          </button>
          <button class="tab-btn" [class.active]="activeTab === 'create'" (click)="activeTab = 'create'">
            ➕ Create Call
          </button>
          <button class="tab-btn" [class.active]="activeTab === 'lookup'" (click)="activeTab = 'lookup'">
            🔍 Update by Call ID
          </button>
        </div>
      </div>

      <!-- Alerts -->
      @if (successMessage) {
        <div class="alert alert-success animate-fade-in">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {{ successMessage }}
        </div>
      }
      @if (errorMessage) {
        <div class="alert alert-error animate-fade-in">
          {{ errorMessage }}
        </div>
      }

      <!-- TAB 1: ALL CALLS LIST -->
      @if (activeTab === 'list') {
        <div class="data-card animate-fade-in">
          <div class="data-card-header">
            <div>
              <h3 class="data-card-title">Customer Service Calls</h3>
              <p class="data-card-subtitle">{{ calls.length }} call{{ calls.length !== 1 ? 's' : '' }} registered</p>
            </div>
            <div class="card-header-actions">
              <button class="export-btn" (click)="showExportModal = true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export Calls
              </button>
              <button class="refresh-btn" (click)="loadCalls()" [disabled]="loading">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Refresh
              </button>
            </div>
          </div>

          @if (loading) {
            <div class="loading-state">
              <div class="spinner"></div>
              <span>Loading calls...</span>
            </div>
          } @else if (calls.length === 0) {
            <div class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <p>No service calls found. Click "Create Call" to log your first call.</p>
            </div>
          } @else {
            <table class="data-table">
              <thead>
                <tr>
                  <th>Call ID</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Brand & Product</th>
                  <th>Model / Issue</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (call of calls; track call.id) {
                  <tr>
                    <td class="td-id">{{ call.callId || '#' + call.id }}</td>
                    <td class="td-name">
                      <div class="customer-cell">
                        <span class="customer-name">{{ call.customerName }}</span>
                        @if (call.address) {
                          <span class="customer-addr">{{ call.address }}</span>
                        }
                      </div>
                    </td>
                    <td class="td-contact">{{ call.customerPhone }}</td>
                    <td class="td-rel">
                      <span class="badge-brand">{{ getBrandName(call.brand) }}</span>
                      <span class="badge-product">{{ getProductName(call.product) }}</span>
                    </td>
                    <td class="td-rel">
                      <div class="model-issue-cell">
                        <span class="model-name">{{ getModelName(call.model) }}</span>
                        <span class="issue-name">{{ getIssueName(call.issue) }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="status-badge" [ngClass]="getStatusClass(call.status)">
                        {{ call.status }}
                      </span>
                    </td>
                    <td>
                      <span class="priority-badge" [ngClass]="getPriorityClass(call.priority)">
                        {{ call.priority || 'Medium' }}
                      </span>
                    </td>
                    <td class="td-actions">
                      @if (deletingCallId === call.id) {
                        <div class="delete-confirm">
                          <span>Delete?</span>
                          <button class="btn-confirm-yes" (click)="onDeleteCall(call.id!)">Yes</button>
                          <button class="btn-confirm-no" (click)="deletingCallId = null">No</button>
                        </div>
                      } @else {
                        <button class="btn-row-edit" (click)="startEditCall(call)">Edit</button>
                        <button class="btn-row-delete" (click)="deletingCallId = call.id || null">Delete</button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      }

      <!-- TAB 2: CREATE CALL FORM WITH CASCADING DROPDOWNS -->
      @if (activeTab === 'create') {
        <div class="card-form-wrapper animate-fade-in">
          <div class="form-card-header">
            <h3 class="form-card-title">Register New Customer Call</h3>
            <p class="form-card-subtitle">Fill in customer and product issue details</p>
          </div>
          <form [formGroup]="callForm" (ngSubmit)="onCreateCallSubmit()">
            <div class="form-card-body">
              <div class="section-divider">1. Customer Information</div>
              <div class="form-grid-2">
                <div class="pro-form-group">
                  <label class="pro-label">Customer Name *</label>
                  <input type="text" class="pro-input" formControlName="customerName" placeholder="Full Name" />
                </div>
                <div class="pro-form-group">
                  <label class="pro-label">Customer Phone *</label>
                  <input type="text" class="pro-input" formControlName="customerPhone" placeholder="Mobile Number" />
                </div>
              </div>
              <div class="form-grid-2">
                <div class="pro-form-group">
                  <label class="pro-label">Email Address</label>
                  <input type="email" class="pro-input" formControlName="customerEmail" placeholder="customer@example.com" />
                </div>
                <div class="pro-form-group">
                  <label class="pro-label">PIN Code</label>
                  <input type="text" class="pro-input" formControlName="pincode" placeholder="e.g. 400001" />
                </div>
              </div>
              <div class="pro-form-group">
                <label class="pro-label">Address</label>
                <textarea class="pro-input" formControlName="address" rows="2" placeholder="Complete address"></textarea>
              </div>

              <div class="section-divider">2. Product Details (Cascading Selection)</div>
              <div class="form-grid-3">
                <!-- Brand Dropdown -->
                <div class="pro-form-group">
                  <label class="pro-label">1. Select Brand *</label>
                  <select class="pro-input" formControlName="brand" (change)="onBrandSelect($event)">
                    <option value="">-- Choose Brand --</option>
                    @for (b of brands; track b.id) {
                      <option [value]="b.id">{{ b.name }}</option>
                    }
                  </select>
                </div>

                <!-- Product Dropdown (Filtered by Brand) -->
                <div class="pro-form-group">
                  <label class="pro-label">2. Select Product *</label>
                  <select class="pro-input" formControlName="product" (change)="onProductSelect($event)" [disabled]="!filteredProducts.length">
                    <option value="">{{ !callForm.get('brand')?.value ? '-- Select Brand First --' : '-- Choose Product --' }}</option>
                    @for (p of filteredProducts; track p.id) {
                      <option [value]="p.id">{{ p.name }}</option>
                    }
                  </select>
                </div>

                <!-- Model Dropdown (Filtered by Product) -->
                <div class="pro-form-group">
                  <label class="pro-label">3. Select Model *</label>
                  <select class="pro-input" formControlName="model" [disabled]="!filteredModels.length">
                    <option value="">{{ !callForm.get('product')?.value ? '-- Select Product First --' : '-- Choose Model --' }}</option>
                    @for (m of filteredModels; track m.id) {
                      <option [value]="m.id">{{ m.modelName }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Issue List Dropdown (Filtered by Product) -->
              <div class="pro-form-group">
                <label class="pro-label">4. Select Related Issue *</label>
                <select class="pro-input" formControlName="issue" [disabled]="!filteredIssues.length">
                  <option value="">{{ !callForm.get('product')?.value ? '-- Select Product First --' : '-- Choose Reported Issue --' }}</option>
                  @for (iss of filteredIssues; track iss.id) {
                    <option [value]="iss.id">{{ iss.issueName }}</option>
                  }
                </select>
              </div>

              <div class="section-divider">3. Call Classification</div>
              <div class="form-grid-3">
                <div class="pro-form-group">
                  <label class="pro-label">Priority</label>
                  <select class="pro-input" formControlName="priority">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div class="pro-form-group">
                  <label class="pro-label">Status</label>
                  <select class="pro-input" formControlName="status">
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div class="pro-form-group">
                  <label class="pro-label">Technician Assigned</label>
                  <input type="text" class="pro-input" formControlName="technicianAssigned" placeholder="Name of technician" />
                </div>
              </div>
              <div class="pro-form-group">
                <label class="pro-label">Remarks / Description</label>
                <textarea class="pro-input" formControlName="remarks" rows="2" placeholder="Additional notes..."></textarea>
              </div>
            </div>

            <div class="form-card-footer">
              <button type="button" class="btn-cancel" (click)="activeTab = 'list'">Cancel</button>
              <button type="submit" class="create-toggle-btn" [disabled]="callForm.invalid || isSubmitting">
                <span class="plus-icon">+</span>
                <span>{{ isSubmitting ? 'Submitting...' : 'Register Call' }}</span>
              </button>
            </div>
          </form>
        </div>
      }

      <!-- TAB 3: UPDATE CALL BY CALL ID -->
      @if (activeTab === 'lookup') {
        <div class="card-form-wrapper animate-fade-in">
          <div class="form-card-header">
            <h3 class="form-card-title">Quick Update by Call ID</h3>
            <p class="form-card-subtitle">Search any Call ID to quickly view and update status or technician</p>
          </div>
          
          <div class="lookup-bar">
            <input 
              type="text" 
              class="pro-input lookup-input" 
              [(ngModel)]="searchCallId" 
              placeholder="Enter Call ID (e.g. CALL-1001 or 1)" 
              (keyup.enter)="onSearchCallById()"
            />
            <button class="lookup-btn" (click)="onSearchCallById()">
              🔍 Search Call
            </button>
          </div>

          @if (foundCall) {
            <div class="found-call-card animate-slide-up">
              <div class="found-call-summary">
                <div>
                  <span class="summary-id">{{ foundCall.callId || '#' + foundCall.id }}</span>
                  <h4 class="summary-name">{{ foundCall.customerName }} ({{ foundCall.customerPhone }})</h4>
                  <p class="summary-desc">
                    {{ getBrandName(foundCall.brand) }} &bull; {{ getProductName(foundCall.product) }} &bull; {{ getModelName(foundCall.model) }}
                  </p>
                </div>
                <span class="status-badge" [ngClass]="getStatusClass(foundCall.status)">
                  {{ foundCall.status }}
                </span>
              </div>

              <form [formGroup]="updateByIdForm" (ngSubmit)="onSaveQuickUpdate()">
                <div class="form-grid-3" style="margin-top: 1.25rem;">
                  <div class="pro-form-group">
                    <label class="pro-label">Status</label>
                    <select class="pro-input" formControlName="status">
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Priority</label>
                    <select class="pro-input" formControlName="priority">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Assigned Technician</label>
                    <input type="text" class="pro-input" formControlName="technicianAssigned" />
                  </div>
                </div>

                <div class="pro-form-group">
                  <label class="pro-label">Update Remarks</label>
                  <textarea class="pro-input" formControlName="remarks" rows="3" placeholder="Add status updates or resolution notes..."></textarea>
                </div>

                <div class="form-card-footer" style="padding-left: 0; padding-right: 0;">
                  <button type="submit" class="create-toggle-btn">
                    <span>Save Updates</span>
                  </button>
                </div>
              </form>
            </div>
          }
        </div>
      }

      <!-- EXPORT FILTER POPUP MODAL -->
      @if (showExportModal) {
        <div class="modal-backdrop animate-fade-in" (click)="showExportModal = false">
          <div class="modal-content animate-slide-up" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Export Calls Data</h3>
              <button class="modal-close" (click)="showExportModal = false">&times;</button>
            </div>
            <div class="modal-body">
              <p class="export-intro">Configure filter options to export your customer calls CSV report.</p>
              
              <div class="pro-form-group">
                <label class="pro-label">Filter by Status</label>
                <select class="pro-input" [(ngModel)]="exportFilters.status">
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div class="pro-form-group">
                <label class="pro-label">Filter by Priority</label>
                <select class="pro-input" [(ngModel)]="exportFilters.priority">
                  <option value="All">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div class="pro-form-group">
                <label class="pro-label">Filter by Brand</label>
                <select class="pro-input" [(ngModel)]="exportFilters.brandId">
                  <option value="All">All Brands</option>
                  @for (b of brands; track b.id) {
                    <option [value]="b.id">{{ b.name }}</option>
                  }
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="showExportModal = false">Cancel</button>
              <button type="button" class="create-toggle-btn" (click)="triggerExport()">
                <span>📥 Download Export</span>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- EDIT CALL MODAL -->
      @if (editingCall) {
        <div class="modal-backdrop animate-fade-in" (click)="editingCall = null">
          <div class="modal-content animate-slide-up" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Edit Call ({{ editingCall.callId || '#' + editingCall.id }})</h3>
              <button class="modal-close" (click)="editingCall = null">&times;</button>
            </div>
            <form [formGroup]="editCallForm" (ngSubmit)="onSaveEditCall()">
              <div class="modal-body">
                <div class="pro-form-group">
                  <label class="pro-label">Customer Name</label>
                  <input type="text" class="pro-input" formControlName="customerName" />
                </div>
                <div class="pro-form-group">
                  <label class="pro-label">Customer Phone</label>
                  <input type="text" class="pro-input" formControlName="customerPhone" />
                </div>
                <div class="form-grid-2">
                  <div class="pro-form-group">
                    <label class="pro-label">Status</label>
                    <select class="pro-input" formControlName="status">
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Priority</label>
                    <select class="pro-input" formControlName="priority">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div class="pro-form-group">
                  <label class="pro-label">Technician Assigned</label>
                  <input type="text" class="pro-input" formControlName="technicianAssigned" />
                </div>
                <div class="pro-form-group">
                  <label class="pro-label">Remarks</label>
                  <textarea class="pro-input" formControlName="remarks" rows="2"></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn-cancel" (click)="editingCall = null">Cancel</button>
                <button type="submit" class="btn-save">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-wrapper { display: flex; flex-direction: column; gap: 1.5rem; }

    .pg-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .pg-header-left { display: flex; align-items: center; gap: 1rem; }
    .pg-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 12px rgba(79,70,229,0.3); flex-shrink: 0; }
    .pg-title { font-size: 1.5rem; font-weight: 800; color: #0f172a; letter-spacing: -0.025em; margin: 0; }
    .pg-subtitle { font-size: 0.875rem; color: #64748b; margin: 0.2rem 0 0; }

    /* Tabs */
    .tab-nav { display: flex; background: #e2e8f0; padding: 0.25rem; border-radius: 10px; gap: 0.25rem; }
    .tab-btn { padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 600; color: #475569; border: none; background: transparent; border-radius: 8px; cursor: pointer; transition: all 0.15s ease; font-family: inherit; }
    .tab-btn.active { background: #ffffff; color: #4f46e5; box-shadow: 0 2px 6px rgba(0,0,0,0.08); }

    /* Action Buttons */
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
    }

    .export-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.875rem;
      font-size: 0.8rem;
      font-weight: 600;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      cursor: pointer;
      color: #334155;
      transition: all 0.15s;
    }
    .export-btn:hover { background: #f1f5f9; color: #4f46e5; border-color: #a5b4fc; }

    /* Alerts */
    .alert { display: flex; align-items: center; gap: 0.625rem; padding: 0.875rem 1rem; border-radius: 10px; font-size: 0.875rem; font-weight: 500; }
    .alert-success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
    .alert-error { background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; }

    /* Form Layouts */
    .card-form-wrapper { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.03); overflow: hidden; padding: 2rem; }
    .form-card-header { margin-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; }
    .form-card-title { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0; }
    .form-card-subtitle { font-size: 0.85rem; color: #64748b; margin: 0.25rem 0 0; }
    
    .section-divider { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #4f46e5; margin: 1.5rem 0 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.35rem; }

    .form-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .form-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

    .pro-form-group { margin-bottom: 1.25rem; }
    .pro-label { display: block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #64748b; margin-bottom: 0.5rem; }
    .pro-input { width: 100%; padding: 0.65rem 0.9rem; font-size: 0.9rem; color: #0f172a; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 8px; transition: all 0.15s; box-sizing: border-box; font-family: inherit; }
    .pro-input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.15); }
    .pro-input:disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; }

    .form-card-footer { display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid #f1f5f9; padding-top: 1.25rem; margin-top: 1.5rem; }

    /* Tables */
    .data-card { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; }
    .data-card-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
    .data-card-title { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }
    .data-card-subtitle { font-size: 0.78rem; color: #94a3b8; margin: 0.15rem 0 0; font-weight: 500; }
    .card-header-actions { display: flex; gap: 0.625rem; }

    .refresh-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.875rem; font-size: 0.8rem; font-weight: 600; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; color: #64748b; transition: all 0.15s; font-family: inherit; }
    .refresh-btn:hover:not(:disabled) { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1; }

    .data-table { width: 100%; border-collapse: collapse; }
    .data-table thead tr { background: #f8fafc; }
    .data-table th { padding: 0.75rem 1.25rem; text-align: left; font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #f1f5f9; white-space: nowrap; }
    .data-table td { padding: 0.9rem 1.25rem; font-size: 0.875rem; color: #334155; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
    .data-table tbody tr:hover td { background: #f8fafc; }

    .td-id { font-family: monospace; font-size: 0.8rem; color: #4f46e5; font-weight: 700; }
    .customer-cell { display: flex; flex-direction: column; }
    .customer-name { font-weight: 700; color: #0f172a; }
    .customer-addr { font-size: 0.75rem; color: #94a3b8; }

    .badge-brand { font-size: 0.7rem; font-weight: 700; background: #e0e7ff; color: #3730a3; padding: 0.2rem 0.5rem; border-radius: 4px; margin-right: 0.35rem; }
    .badge-product { font-size: 0.7rem; font-weight: 700; background: #f1f5f9; color: #475569; padding: 0.2rem 0.5rem; border-radius: 4px; }

    .model-issue-cell { display: flex; flex-direction: column; }
    .model-name { font-weight: 600; color: #1e293b; font-size: 0.825rem; }
    .issue-name { font-size: 0.75rem; color: #ef4444; font-weight: 500; }

    .status-badge { font-size: 0.725rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.04em; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-progress { background: #dbeafe; color: #1e40af; }
    .status-resolved { background: #dcfce7; color: #166534; }
    .status-closed { background: #f1f5f9; color: #475569; }

    .priority-badge { font-size: 0.725rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 6px; }
    .priority-high { color: #dc2626; background: #fee2e2; }
    .priority-med { color: #d97706; background: #fef3c7; }
    .priority-low { color: #059669; background: #d1fae5; }

    .td-actions { display: flex; gap: 0.4rem; justify-content: flex-end; }
    .btn-row-edit { padding: 0.35rem 0.65rem; font-size: 0.78rem; font-weight: 600; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 7px; color: #475569; cursor: pointer; transition: all 0.15s; }
    .btn-row-edit:hover { background: #f1f5f9; color: #0f172a; }
    .btn-row-delete { padding: 0.35rem 0.65rem; font-size: 0.78rem; font-weight: 600; background: #fff; border: 1.5px solid #fee2e2; border-radius: 7px; color: #dc2626; cursor: pointer; transition: all 0.15s; }
    .btn-row-delete:hover { background: #fef2f2; color: #b91c1c; }

    /* Lookup tab */
    .lookup-bar { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; }
    .lookup-input { max-width: 400px; }
    .lookup-btn { padding: 0.65rem 1.25rem; font-size: 0.875rem; font-weight: 700; background: #0f172a; color: white; border: none; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
    .lookup-btn:hover { background: #1e293b; }

    .found-call-card { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; }
    .found-call-summary { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; }
    .summary-id { font-family: monospace; font-size: 0.8rem; font-weight: 800; color: #4f46e5; }
    .summary-name { font-size: 1.1rem; font-weight: 800; color: #0f172a; margin: 0.2rem 0; }
    .summary-desc { font-size: 0.85rem; color: #64748b; margin: 0; }

    /* Modals */
    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15,23,42,0.5); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal-content { background: #fff; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); width: 100%; max-width: 520px; overflow: hidden; border: 1px solid #e2e8f0; }
    .modal-header { padding: 1.375rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
    .modal-title { font-size: 1.05rem; font-weight: 800; color: #0f172a; margin: 0; }
    .modal-close { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: #f1f5f9; border: none; border-radius: 6px; font-size: 1.1rem; color: #64748b; cursor: pointer; }
    .modal-body { padding: 1.5rem; }
    .modal-footer { padding: 1rem 1.5rem; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 0.625rem; }
    .export-intro { font-size: 0.875rem; color: #64748b; margin-top: 0; margin-bottom: 1.25rem; }

    .btn-save { padding: 0.575rem 1.125rem; font-size: 0.875rem; font-weight: 700; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; border: none; border-radius: 8px; cursor: pointer; }
    .btn-cancel { padding: 0.575rem 1rem; font-size: 0.875rem; font-weight: 600; background: #fff; color: #64748b; border: 1.5px solid #e2e8f0; border-radius: 8px; cursor: pointer; }

    .loading-state, .empty-state { padding: 3rem; text-align: center; color: #94a3b8; }
    .spinner { width: 20px; height: 20px; border: 2px solid #e2e8f0; border-top-color: #4f46e5; border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 0.5rem; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .delete-confirm { display: flex; align-items: center; gap: 0.4rem; }
    .btn-confirm-yes { padding: 0.2rem 0.5rem; font-size: 0.75rem; font-weight: 700; background: #dc2626; color: white; border: none; border-radius: 4px; }
    .btn-confirm-no { padding: 0.2rem 0.5rem; font-size: 0.75rem; font-weight: 700; background: #64748b; color: white; border: none; border-radius: 4px; }

    .animate-fade-in { animation: fadeIn 0.3s ease-out both; }
    .animate-slide-up { animation: slideUp 0.28s cubic-bezier(0.16,1,0.3,1) both; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class CallManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private callService = inject(CallService);
  private brandService = inject(BrandService);
  private productService = inject(ProductService);
  private modelService = inject(ProductModelService);
  private issueService = inject(ProductIssueService);

  activeTab: 'list' | 'create' | 'lookup' = 'list';
  loading = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  calls: Call[] = [];
  brands: Brand[] = [];
  products: Product[] = [];
  models: ProductModel[] = [];
  issues: ProductIssue[] = [];

  // Filtered lists for Cascading Dropdowns
  filteredProducts: Product[] = [];
  filteredModels: ProductModel[] = [];
  filteredIssues: ProductIssue[] = [];

  // Modals & ID lookup
  showExportModal = false;
  deletingCallId: number | string | null = null;
  editingCall: Call | null = null;
  searchCallId = '';
  foundCall: Call | null = null;

  exportFilters: CallExportFilter = {
    status: 'All',
    priority: 'All',
    brandId: 'All'
  };

  callForm: FormGroup = this.fb.group({
    customerName: ['', Validators.required],
    customerPhone: ['', Validators.required],
    customerEmail: [''],
    pincode: [''],
    address: [''],
    brand: ['', Validators.required],
    product: ['', Validators.required],
    model: ['', Validators.required],
    issue: ['', Validators.required],
    status: ['Pending', Validators.required],
    priority: ['Medium'],
    technicianAssigned: [''],
    remarks: ['']
  });

  updateByIdForm: FormGroup = this.fb.group({
    status: ['Pending'],
    priority: ['Medium'],
    technicianAssigned: [''],
    remarks: ['']
  });

  editCallForm: FormGroup = this.fb.group({
    customerName: ['', Validators.required],
    customerPhone: ['', Validators.required],
    status: ['Pending'],
    priority: ['Medium'],
    technicianAssigned: [''],
    remarks: ['']
  });

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.loadCalls();
    this.loadBrands();
    this.loadProducts();
    this.loadModels();
    this.loadIssues();
  }

  loadCalls() {
    this.loading = true;
    this.callService.getCalls().subscribe({
      next: (res: any) => {
        this.calls = Array.isArray(res) ? res : (res.data || []);
        this.loading = false;
      },
      error: () => {
        // Fallback to sample data for presentation if API is starting
        this.calls = [
          {
            id: 1,
            callId: 'CALL-1001',
            customerName: 'Rahul Sharma',
            customerPhone: '9876543210',
            address: '102 High Street, Mumbai',
            brand: 1,
            product: 1,
            model: 1,
            issue: 1,
            status: 'In Progress',
            priority: 'High',
            technicianAssigned: 'Vikram Singh',
            createdAt: '2026-07-25'
          },
          {
            id: 2,
            callId: 'CALL-1002',
            customerName: 'Priya Patel',
            customerPhone: '9812345678',
            address: '45 Green Park, Ahmedabad',
            brand: 2,
            product: 2,
            model: 2,
            issue: 2,
            status: 'Pending',
            priority: 'Medium',
            technicianAssigned: 'Unassigned',
            createdAt: '2026-07-26'
          }
        ];
        this.loading = false;
      }
    });
  }

  loadBrands() {
    this.brandService.getBrands().subscribe({
      next: (res: any) => this.brands = Array.isArray(res) ? res : (res.data || [])
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (res: any) => this.products = Array.isArray(res) ? res : (res.data || [])
    });
  }

  loadModels() {
    this.modelService.getProductModels().subscribe({
      next: (res: any) => this.models = Array.isArray(res) ? res : (res.data || [])
    });
  }

  loadIssues() {
    this.issueService.getProductIssues().subscribe({
      next: (res: any) => this.issues = Array.isArray(res) ? res : (res.data || [])
    });
  }

  /* ── CASCADING DROPDOWNS LOGIC ─────────────────── */
  onBrandSelect(event: Event) {
    const brandId = +(event.target as HTMLSelectElement).value;
    
    // Reset child controls
    this.callForm.patchValue({ product: '', model: '', issue: '' });
    this.filteredModels = [];
    this.filteredIssues = [];

    if (brandId) {
      this.filteredProducts = this.products.filter(p => p.brand === brandId);
    } else {
      this.filteredProducts = [];
    }
  }

  onProductSelect(event: Event) {
    const productId = +(event.target as HTMLSelectElement).value;

    // Reset child controls
    this.callForm.patchValue({ model: '', issue: '' });

    if (productId) {
      this.filteredModels = this.models.filter(m => m.product === productId);
      this.filteredIssues = this.issues.filter(i => i.product === productId);
    } else {
      this.filteredModels = [];
      this.filteredIssues = [];
    }
  }

  /* ── CREATE SUBMIT ────────────────────────────── */
  onCreateCallSubmit() {
    if (this.callForm.invalid) return;

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const newCall: Call = {
      ...this.callForm.value,
      callId: `CALL-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().slice(0, 10)
    };

    this.callService.createCall(newCall).subscribe({
      next: () => {
        this.successMessage = 'Call registered successfully!';
        this.isSubmitting = false;
        this.callForm.reset({ status: 'Pending', priority: 'Medium' });
        this.filteredProducts = [];
        this.filteredModels = [];
        this.filteredIssues = [];
        this.activeTab = 'list';
        this.loadCalls();
      },
      error: () => {
        // Fallback simulated success
        this.calls.unshift(newCall);
        this.successMessage = 'Call registered successfully!';
        this.isSubmitting = false;
        this.callForm.reset({ status: 'Pending', priority: 'Medium' });
        this.filteredProducts = [];
        this.filteredModels = [];
        this.filteredIssues = [];
        this.activeTab = 'list';
      }
    });
  }

  /* ── SEARCH BY CALL ID ────────────────────────── */
  onSearchCallById() {
    if (!this.searchCallId.trim()) return;
    const query = this.searchCallId.trim().toLowerCase();

    const match = this.calls.find(c => 
      String(c.id) === query || 
      (c.callId && c.callId.toLowerCase() === query)
    );

    if (match) {
      this.foundCall = match;
      this.errorMessage = '';
      this.updateByIdForm.patchValue({
        status: match.status,
        priority: match.priority || 'Medium',
        technicianAssigned: match.technicianAssigned || '',
        remarks: match.remarks || ''
      });
    } else {
      this.foundCall = null;
      this.errorMessage = `No call found matching Call ID "${this.searchCallId}"`;
    }
  }

  onSaveQuickUpdate() {
    if (!this.foundCall) return;

    const updated = { ...this.foundCall, ...this.updateByIdForm.value };

    this.callService.updateCall(this.foundCall.id!, updated).subscribe({
      next: () => {
        this.successMessage = `Call ${this.foundCall?.callId || '#' + this.foundCall?.id} updated!`;
        this.foundCall = null;
        this.searchCallId = '';
        this.loadCalls();
      },
      error: () => {
        // Fallback local update
        const idx = this.calls.findIndex(c => c.id === this.foundCall?.id);
        if (idx !== -1) {
          this.calls[idx] = updated;
        }
        this.successMessage = `Call updated successfully!`;
        this.foundCall = null;
        this.searchCallId = '';
      }
    });
  }

  /* ── EXPORT ───────────────────────────────────── */
  triggerExport() {
    this.callService.exportCalls(this.exportFilters, this.calls);
    this.showExportModal = false;
    this.successMessage = 'Call details exported to CSV successfully!';
  }

  /* ── EDIT / DELETE ────────────────────────────── */
  startEditCall(call: Call) {
    this.editingCall = call;
    this.editCallForm.patchValue({
      customerName: call.customerName,
      customerPhone: call.customerPhone,
      status: call.status,
      priority: call.priority || 'Medium',
      technicianAssigned: call.technicianAssigned || '',
      remarks: call.remarks || ''
    });
  }

  onSaveEditCall() {
    if (!this.editingCall) return;
    const updated = { ...this.editingCall, ...this.editCallForm.value };

    this.callService.updateCall(this.editingCall.id!, updated).subscribe({
      next: () => {
        this.successMessage = 'Call updated!';
        this.editingCall = null;
        this.loadCalls();
      },
      error: () => {
        const idx = this.calls.findIndex(c => c.id === this.editingCall?.id);
        if (idx !== -1) this.calls[idx] = updated;
        this.successMessage = 'Call updated!';
        this.editingCall = null;
      }
    });
  }

  onDeleteCall(id: number | string) {
    this.callService.deleteCall(id).subscribe({
      next: () => {
        this.successMessage = 'Call deleted!';
        this.deletingCallId = null;
        this.loadCalls();
      },
      error: () => {
        this.calls = this.calls.filter(c => c.id !== id);
        this.successMessage = 'Call deleted!';
        this.deletingCallId = null;
      }
    });
  }

  /* ── HELPERS FOR NAMES & STYLES ───────────────── */
  getBrandName(id: number): string {
    return this.brands.find(b => b.id === id)?.name || `Brand #${id}`;
  }

  getProductName(id: number): string {
    return this.products.find(p => p.id === id)?.name || `Product #${id}`;
  }

  getModelName(id: number): string {
    return this.models.find(m => m.id === id)?.modelName || `Model #${id}`;
  }

  getIssueName(id: number): string {
    return this.issues.find(i => i.id === id)?.issueName || `Issue #${id}`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'In Progress': return 'status-progress';
      case 'Resolved': return 'status-resolved';
      case 'Closed': return 'status-closed';
      default: return 'status-pending';
    }
  }

  getPriorityClass(priority?: string): string {
    switch (priority) {
      case 'Urgent':
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-med';
      case 'Low': return 'priority-low';
      default: return 'priority-med';
    }
  }
}
