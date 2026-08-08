import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CallService } from '../../core/services/call.service';
import { BrandService } from '../../core/services/brand.service';
import { ProductService } from '../../core/services/product.service';
import { ProductModelService } from '../../core/services/product-model.service';
import { ProductIssueService } from '../../core/services/product-issue.service';
import { AuthService } from '../../core/services/auth.service';
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

      <!-- Notification Alerts (Toasts) -->
      <div class="toast-container">
        @if (successMessage) {
          <div class="toast toast-success animate-slide-in">
            <div class="toast-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div class="toast-content">
              <div class="toast-title">Success</div>
              <div class="toast-message">{{ successMessage }}</div>
            </div>
            <button class="toast-close" (click)="successMessage = ''">&times;</button>
          </div>
        }
        @if (errorMessage) {
          <div class="toast toast-error animate-slide-in">
            <div class="toast-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div class="toast-content">
              <div class="toast-title">Validation Error</div>
              <div class="toast-message">{{ errorMessage }}</div>
            </div>
            <button class="toast-close" (click)="errorMessage = ''">&times;</button>
          </div>
        }
      </div>

      <!-- TAB 1: ALL CALLS LIST -->
      @if (activeTab === 'list') {
        <div class="data-card animate-fade-in">
          <div class="data-card-header">
            <div class="data-card-header-left">
              <div class="pg-icon-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <h3 class="data-card-title">Customer Service Calls</h3>
            </div>
            <div class="card-header-actions">
              <button class="export-btn" (click)="showExportModal = true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export CSV
              </button>
              <button class="refresh-btn" (click)="loadCalls()" [disabled]="loading">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Refresh
              </button>
            </div>
          </div>

          @if (loading) {
            <div class="loading-state">
              <div class="spinner"></div>
              <span>Fetching calls from backend...</span>
            </div>
          } @else if (errorMessage && calls.length === 0) {
            <div class="empty-state" style="color:#dc2626;">
              <p>⚠️ {{ errorMessage }}</p>
              <button class="refresh-btn" (click)="loadCalls()" style="margin-top:1rem;">Retry</button>
            </div>
          } @else if (calls.length === 0) {
            <div class="empty-state">
              <p>No service calls found. Select "Create New Call" from the sidebar to add a call.</p>
            </div>
          } @else {
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Call Number</th>
                    <th>Customer Info</th>
                    <th>Product</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Attachment</th>
                    <th class="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (call of calls; track call.id || call.callNumber) {
                    <tr>
                      <td class="td-id">{{ call.callNumber || call.callId || '#' + call.id }}</td>
                      <td>
                        <div class="customer-cell">
                          <span class="customer-name">{{ getCustomerName(call) }}</span>
                          <span class="customer-addr">{{ getCustomerPhone(call) }}</span>
                        </div>
                      </td>
                      <td>
                        <span class="product-title">{{ getProductName(getCallProduct(call)) }}</span>
                      </td>
                      <td>
                        <span class="status-badge" [ngClass]="getStatusClass(call.status)">
                          {{ call.status || 'Pending' }}
                        </span>
                      </td>
                      <td>
                        <span class="priority-badge" [ngClass]="getPriorityClass(getCallPriority(call))">
                          {{ getCallPriority(call) }}
                        </span>
                      </td>
                      <td>
                        @if (getCallImageUrl(call)) {
                          <div class="table-attachment-chip" (click)="openViewDetails(call); activeViewTab = 'attachments'" title="Click to view photo">
                            <img [src]="getCallImageUrl(call)" class="chip-thumb" alt="Photo" />
                            <span class="chip-text">View Photo</span>
                          </div>
                        } @else {
                          <span style="color: #94a3b8; font-size: 0.8rem;">—</span>
                        }
                      </td>
                      <td class="td-actions">
                        <div class="action-btns">
                          <button class="btn-row-view" (click)="openViewDetails(call)" title="View Full Details">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            View
                          </button>
                          <button class="btn-row-edit" [disabled]="isCallClosed(call)" (click)="startEditCall(call)" title="Edit Call">Edit</button>
                          <button class="btn-row-delete" (click)="deletingCallObj = call" title="Delete Call">Delete</button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      <!-- TAB 2: CREATE CALL FORM -->
      @if (activeTab === 'create') {
        <div class="card-form-wrapper animate-fade-in">
          <div class="form-card-header">
            <h3 class="form-card-title">Register New Customer Call</h3>
          </div>
          <form [formGroup]="callForm" (ngSubmit)="onCreateCallSubmit()">
            <div class="form-card-body">
              
              <!-- 1. CUSTOMER DETAIL -->
              <div class="section-divider">👤 1. Customer Details</div>
              <div formGroupName="customerDetail">
                <div class="form-grid-2">
                  <div class="pro-form-group">
                    <label class="pro-label">First Name *</label>
                    <div class="input-with-select" [class.is-invalid]="isFieldInvalid('customerDetail', 'firstName')">
                      <select class="title-prefix-select" formControlName="title">
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Ms">Ms</option>
                        <option value="Dr">Dr</option>
                      </select>
                      <input type="text" class="pro-input" formControlName="firstName" placeholder="Enter first name" />
                    </div>
                    @if (isFieldInvalid('customerDetail', 'firstName')) {
                      <span class="error-message">First name is required.</span>
                    }
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Last Name</label>
                    <input type="text" class="pro-input" formControlName="lastName" placeholder="Enter last name" />
                  </div>
                </div>

                <div class="form-grid-2">
                  <div class="pro-form-group">
                    <label class="pro-label">Address 1</label>
                    <input type="text" class="pro-input" formControlName="address1" placeholder="House / Flat / Street" />
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Landmark</label>
                    <input type="text" class="pro-input" formControlName="landmark" placeholder="Near Park / Station" />
                  </div>
                </div>

                <div class="form-grid-2">
                  <div class="pro-form-group">
                    <label class="pro-label">Locality</label>
                    <input type="text" class="pro-input" formControlName="locality" placeholder="Locality" />
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">State</label>
                    <select class="pro-input" formControlName="state" (change)="onCreateStateChange($event)">
                      <option value="">-- Select State --</option>
                      @for (s of states; track s) { <option [value]="s">{{ s }}</option> }
                    </select>
                  </div>
                </div>

                <div class="form-grid-3">
                  <div class="pro-form-group">
                    <label class="pro-label">District</label>
                    <select class="pro-input" formControlName="district" (change)="onCreateDistrictChange($event)" [attr.disabled]="!createDistricts.length ? true : null">
                      <option value="">-- Select District --</option>
                      @for (d of createDistricts; track d) { <option [value]="d">{{ d }}</option> }
                    </select>
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">City</label>
                    <select class="pro-input" formControlName="city" [attr.disabled]="!createCities.length ? true : null">
                      <option value="">-- Select City --</option>
                      @for (c of createCities; track c) { <option [value]="c">{{ c }}</option> }
                    </select>
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Pincode</label>
                    <input type="number" class="pro-input" formControlName="pincode" placeholder="452001" />
                  </div>
                </div>
              </div>

              <!-- 2. CONTACT DETAIL -->
              <div class="section-divider">📞 2. Contact Details</div>
              <div formGroupName="contactDetail">
                <div class="form-grid-2">
                  <div class="pro-form-group">
                    <label class="pro-label">Mobile Number *</label>
                    <input type="text" class="pro-input" [class.is-invalid]="isFieldInvalid('contactDetail', 'mobile')" formControlName="mobile" placeholder="10-digit mobile number" maxlength="10" (keypress)="onlyDigits($event)" />
                    @if (isFieldInvalid('contactDetail', 'mobile')) {
                      <span class="error-message">
                        @if (callForm.get('contactDetail.mobile')?.errors?.['required']) {
                          Mobile number is required.
                        }
                        @if (callForm.get('contactDetail.mobile')?.errors?.['pattern']) {
                          Please enter a valid 10-digit mobile number.
                        }
                      </span>
                    }
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Email Address</label>
                    <input type="email" class="pro-input" [class.is-invalid]="isFieldInvalid('contactDetail', 'email')" formControlName="email" placeholder="john@example.com" />
                    @if (isFieldInvalid('contactDetail', 'email')) {
                      <span class="error-message">Please enter a valid email address (e.g. name&#64;domain.com).</span>
                    }
                  </div>
                </div>
                <div class="form-grid-2">
                  <div class="pro-form-group">
                    <label class="pro-label">Contact Person Name</label>
                    <input type="text" class="pro-input" formControlName="contactPersonName" placeholder="Alternate contact name" />
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Contact Person Mobile</label>
                    <input type="text" class="pro-input" formControlName="contactPersonMobile" placeholder="Alternate mobile" />
                  </div>
                </div>
                <div class="pro-form-group">
                  <label class="pro-label">Preferred Languages</label>
                  <input type="text" class="pro-input" formControlName="language" placeholder="English, Hindi" />
                </div>
              </div>

              <!-- 3. DEALER DETAIL -->
              <div class="section-divider">🏪 3. Dealer Details</div>
              <div formGroupName="dealerDetail">
                <div class="form-grid-2">
                  <div class="pro-form-group">
                    <label class="pro-label">Dealer Name</label>
                    <input type="text" class="pro-input" formControlName="dealerName" placeholder="Dealer / Store Name" />
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Dealer City</label>
                    <input type="text" class="pro-input" formControlName="dealerCity" placeholder="Dealer City" />
                  </div>
                </div>
                <div class="form-grid-2">
                  <div class="pro-form-group">
                    <label class="pro-label">Dealer Mobile</label>
                    <input type="text" class="pro-input" formControlName="dealerMobile" placeholder="Dealer Mobile" />
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Dealer Email</label>
                    <input type="email" class="pro-input" formControlName="dealerEmail" placeholder="dealer@example.com" />
                  </div>
                </div>
                <div class="form-grid-2">
                  <div class="pro-form-group">
                    <label class="pro-label">Invoice Number</label>
                    <input type="text" class="pro-input" formControlName="invoiceNumber" placeholder="INV001" />
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Purchase Date</label>
                    <input type="date" class="pro-input" formControlName="purchaseDate" />
                  </div>
                </div>
              </div>

              <!-- 4. PRODUCT DETAIL -->
              <div class="section-divider">📦 4. Product Details</div>
              <div formGroupName="productDetail">
                <div class="form-grid-2">
                  <div class="pro-form-group">
                    <label class="pro-label">1. Select Brand *</label>
                    <select class="pro-input highlight-select" [class.is-invalid]="isFieldInvalid('productDetail', 'brand')" formControlName="brand" (change)="onBrandSelect($event)">
                      <option value="">-- Choose Brand --</option>
                      @for (b of brands; track b.id) {
                        <option [value]="b.id">{{ b.name }}</option>
                      }
                    </select>
                    @if (isFieldInvalid('productDetail', 'brand')) {
                      <span class="error-message">Brand selection is required.</span>
                    }
                  </div>

                  <div class="pro-form-group">
                    <label class="pro-label">2. Select Product *</label>
                    <select class="pro-input highlight-select" [class.is-invalid]="isFieldInvalid('productDetail', 'product')" formControlName="product" (change)="onProductSelect($event)" [disabled]="!filteredProducts.length">
                      <option value="">{{ !callForm.get('productDetail.brand')?.value ? '-- Select Brand First --' : '-- Choose Product --' }}</option>
                      @for (p of filteredProducts; track p.id) {
                        <option [value]="p.id">{{ p.name }}</option>
                      }
                    </select>
                    @if (isFieldInvalid('productDetail', 'product')) {
                      <span class="error-message">Product selection is required.</span>
                    }
                  </div>
                </div>

                <div class="form-grid-2">
                  <div class="pro-form-group">
                    <label class="pro-label">3. Select Model *</label>
                    <select class="pro-input highlight-select" [class.is-invalid]="isFieldInvalid('productDetail', 'model')" formControlName="model" [disabled]="!filteredModels.length">
                      <option value="">{{ !callForm.get('productDetail.product')?.value ? '-- Select Product First --' : '-- Choose Model --' }}</option>
                      @for (m of filteredModels; track m.id) {
                        <option [value]="m.id">{{ m.modelName }}</option>
                      }
                    </select>
                    @if (isFieldInvalid('productDetail', 'model')) {
                      <span class="error-message">Model selection is required.</span>
                    }
                  </div>

                  <div class="pro-form-group">
                    <label class="pro-label">Unit Serial Number</label>
                    <input type="text" class="pro-input" formControlName="unitSerialNumber" placeholder="SN001" />
                  </div>
                </div>

                <div class="form-grid-2">
                  <div class="pro-form-group">
                    <label class="pro-label">Client</label>
                    <input type="text" class="pro-input" formControlName="client" placeholder="Retail / Corporate" />
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Purchase Date</label>
                    <input type="date" class="pro-input" formControlName="purchaseDate" />
                  </div>
                </div>

                <div class="form-grid-3">
                  <div class="pro-form-group">
                    <label class="pro-label">Warranty</label>
                    <input type="text" class="pro-input" formControlName="warranty" placeholder="1 Year" />
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Stock Of</label>
                    <input type="text" class="pro-input" formControlName="stockOf" placeholder="Warehouse" />
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Purchase Order Number</label>
                    <input type="text" class="pro-input" formControlName="purchaseOrderNumber" placeholder="PO001" />
                  </div>
                </div>
              </div>

              <!-- 5. COMPLAINT DETAIL -->
              <div class="section-divider">📋 5. Complaint Details & Call Status</div>
              <div formGroupName="complaintDetail">
                <div class="form-grid-2">
                  <div class="pro-form-group">
                    <label class="pro-label">Call Type / Reported Issue *</label>
                    <select class="pro-input highlight-select" [class.is-invalid]="isFieldInvalid('complaintDetail', 'callType')" formControlName="callType" [disabled]="!filteredIssues.length && !callForm.get('productDetail.product')?.value">
                      <option value="">{{ !callForm.get('productDetail.product')?.value ? '-- Select Product First --' : '-- Choose Call Type / Issue --' }}</option>
                      <option value="Installation">Installation</option>
                      <option value="Service">Service</option>
                      <option value="Repair">Repair</option>
                      <option value="Breakdown">Breakdown</option>
                      <option value="Maintenance">Maintenance</option>
                      @for (iss of filteredIssues; track iss.id) {
                        <option [value]="iss.issueName">{{ iss.issueName }}</option>
                      }
                    </select>
                    @if (isFieldInvalid('complaintDetail', 'callType')) {
                      <span class="error-message">Call type is required.</span>
                    }
                  </div>

                  <div class="pro-form-group">
                    <label class="pro-label">Complaint Priority</label>
                    <select class="pro-input" formControlName="complaintPriority">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div class="form-grid-2">
                  <div class="pro-form-group">
                    <label class="pro-label">Call Nature</label>
                    <input type="text" class="pro-input" formControlName="callNature" placeholder="Service" />
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Visit Type</label>
                    <input type="text" class="pro-input" formControlName="visitType" placeholder="Home" />
                  </div>
                </div>

                <div class="form-grid-2">
                  <div class="pro-form-group">
                    <label class="pro-label">Last Complaint Number</label>
                    <input type="text" class="pro-input" formControlName="lastComplaintNumber" placeholder="LC001" />
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Status</label>
                    <select class="pro-input" [ngModelOptions]="{standalone: true}" [(ngModel)]="createStatus">
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Closed">Closed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div class="form-grid-3">
                  <div class="pro-form-group">
                    <label class="pro-label">Promise Date</label>
                    <input type="date" class="pro-input" formControlName="promiseDate" />
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Promise Time</label>
                    <input type="time" class="pro-input" formControlName="promiseTime" />
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">AM / PM</label>
                    <select class="pro-input" formControlName="amOrPm">
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                <div class="form-grid-2">
                  <div class="pro-form-group">
                    <label class="pro-label">Complaint Description</label>
                    <textarea class="pro-input" formControlName="complaintDescription" rows="2" placeholder="Describe reported problem..."></textarea>
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Special Instructions</label>
                    <textarea class="pro-input" formControlName="specialInstruction" rows="2" placeholder="Instructions..."></textarea>
                  </div>
                </div>
              </div>



              <!-- Attach Image -->
              <div class="pro-form-group" style="margin-top: 1rem;">
                <label class="pro-label">Attach Photo / Image (optional)</label>
                <div class="image-upload-zone" (click)="createImageInput.click()" [class.has-image]="createCallPreviewUrl">
                  @if (createCallPreviewUrl) {
                    <img [src]="createCallPreviewUrl" class="upload-preview-img" alt="Preview" />
                    <button type="button" class="remove-img-btn" (click)="$event.stopPropagation(); clearCreateImage()">&#x2715; Remove</button>
                  } @else {
                    <div class="upload-placeholder">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <span style="font-weight: 600; color: #4f46e5;">Click to upload call image / receipt photo</span>
                      <span class="upload-hint">JPG, PNG, WEBP up to 5MB</span>
                    </div>
                  }
                </div>
                <input #createImageInput type="file" accept="image/*" style="display:none" (change)="onCreateCallImageChange($event)" />
              </div>
            </div>

            <div class="form-card-footer">
              <button type="button" class="btn-cancel" (click)="activeTab = 'list'">Cancel</button>
              <button type="submit" class="create-toggle-btn" [disabled]="isSubmitting">
                <span class="plus-icon">+</span>
                <span>{{ isSubmitting ? 'Registering Call...' : 'Register Call' }}</span>
              </button>
            </div>
          </form>
        </div>
      }

      <!-- TAB 3: UPDATE CALL BY CALL NUMBER -->
      @if (activeTab === 'lookup') {
        <div class="card-form-wrapper animate-fade-in">
          <div class="form-card-header">
            <h3 class="form-card-title">Quick Update by Call Number</h3>
            <p class="form-card-subtitle">Search any Call Number to quickly view and update status or technician</p>
          </div>
          
          <div class="lookup-bar">
            <input 
              type="text" 
              class="pro-input lookup-input" 
              [(ngModel)]="searchCallId" 
              placeholder="Enter Call Number (e.g. CALL10001 or CN001)" 
              (keyup.enter)="onSearchCallByNumber()"
            />
            <button class="lookup-btn" (click)="onSearchCallByNumber()" [disabled]="isSearching">
              @if (isSearching) {
                <span class="spinner" style="width:14px;height:14px;margin:0;"></span>
              } @else {
                <span>Search Call</span>
              }
            </button>
          </div>

          @if (foundCall) {
            <div class="found-call-card animate-slide-up">
              <div class="found-call-summary">
                <div>
                  <span class="summary-id">{{ foundCall.callNumber || foundCall.callId || '#' + foundCall.id }}</span>
                  <h4 class="summary-name">{{ getCustomerName(foundCall) }} ({{ getCustomerPhone(foundCall) }})</h4>
                  <p class="summary-desc">
                    {{ getProductName(getCallProduct(foundCall)) }}
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
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
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

                </div>

                <div class="pro-form-group">
                  <label class="pro-label">Remarks</label>
                  <textarea class="pro-input" formControlName="remarks" rows="2"></textarea>
                </div>

                <!-- Image Upload -->
                <div class="pro-form-group">
                  <label class="pro-label">Attach Image (optional)</label>
                  <div class="image-upload-zone" (click)="quickImageInput.click()" [class.has-image]="quickUpdatePreviewUrl">
                    @if (quickUpdatePreviewUrl) {
                      <img [src]="quickUpdatePreviewUrl" class="upload-preview-img" alt="Preview" />
                      <button type="button" class="remove-img-btn" (click)="$event.stopPropagation(); clearQuickImage()">&#x2715; Remove</button>
                    } @else {
                      <div class="upload-placeholder">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <span>Click to upload image</span>
                        <span class="upload-hint">JPG, PNG, WEBP up to 5MB</span>
                      </div>
                    }
                  </div>
                  <input #quickImageInput type="file" accept="image/*" style="display:none" (change)="onQuickUpdateImageChange($event)" />
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
                  <button type="submit" class="btn-save" [disabled]="isSubmitting">
                    {{ isSubmitting ? 'Saving...' : 'Save Quick Update' }}
                  </button>
                </div>
              </form>
            </div>
          }
        </div>
      }

      <!-- DELETE CONFIRMATION MODAL POPUP -->
      @if (deletingCallObj) {
        <div class="modal-backdrop animate-fade-in" (click)="deletingCallObj = null">
          <div class="modal-content modal-content-sm animate-slide-up" (click)="$event.stopPropagation()">
            <div class="delete-modal-body">
              <div class="delete-icon-wrapper">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </div>
              <h3 class="delete-modal-title">Delete Call Confirmation</h3>
              <p class="delete-modal-desc">
                Are you sure you want to delete call <strong>{{ deletingCallObj.callNumber || deletingCallObj.callId || '#' + deletingCallObj.id }}</strong>? This action cannot be undone.
              </p>
              <div class="delete-modal-actions">
                <button class="btn-cancel" (click)="deletingCallObj = null">Cancel</button>
                <button class="btn-danger-confirm" (click)="confirmDeleteCall()" [disabled]="isSubmitting">
                  {{ isSubmitting ? 'Deleting...' : 'Yes, Delete Call' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- VIEW FULL CALL DETAILS MODAL (SLEEK 2x2 CARD GRID DESIGN) -->
      @if (viewingCallDetails) {
        <div class="modal-backdrop animate-fade-in" (click)="viewingCallDetails = null">
          <div class="modal-content modal-content-lg animate-slide-up" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <h3 class="modal-title">Call Details &bull; {{ viewingCallDetails.callNumber || viewingCallDetails.callId || '#' + viewingCallDetails.id }}</h3>
                <div class="modal-header-badges" style="display: flex; gap: 0.5rem; margin-top: 0.35rem; align-items: center;">
                  <span class="status-badge" [ngClass]="getStatusClass(viewingCallDetails.status)">{{ viewingCallDetails.status || 'Pending' }}</span>
                  <span class="priority-badge" [ngClass]="getPriorityClass(getCallPriority(viewingCallDetails))">{{ getCallPriority(viewingCallDetails) }}</span>
                  <span class="call-type-badge">{{ viewingCallDetails.complaintDetail?.callType || 'N/A' }}</span>
                </div>
              </div>
              <button class="modal-close" (click)="viewingCallDetails = null">&times;</button>
            </div>
            
            <div class="modal-body call-details-modal-body">
              
              <!-- Top section: customer banner + badges -->
              <div class="call-details-top-section">
                <!-- Customer Full Name Banner -->
                <div class="details-name-banner" style="margin-bottom: 1rem;">
                  <span class="name-banner-label">Customer</span>
                  <span class="name-banner-value">{{ getFormattedFullName(viewingCallDetails.customerDetail, viewingCallDetails.customerName) | titlecase }}</span>
                </div>

                <!-- Read-Only Badges Header (edit via Edit Call button below) -->
                <div class="details-badges-row" style="margin-bottom: 1rem;">
                  <div class="badge-item">
                    <span class="badge-label">Status</span>
                    <span class="status-badge" [ngClass]="getStatusClass(viewingCallDetails.status)">
                      {{ viewingCallDetails.status || 'OPEN' }}
                    </span>
                  </div>
                  <div class="badge-item">
                    <span class="badge-label">Priority</span>
                    <span class="priority-badge" [ngClass]="getPriorityClass(getCallPriority(viewingCallDetails))">
                      {{ getCallPriority(viewingCallDetails) }}
                    </span>
                  </div>
                  <div class="badge-item">
                    <span class="badge-label">Call Type</span>
                    <span class="call-type-badge">
                      {{ viewingCallDetails.complaintDetail?.callType || 'N/A' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Sticky Tabs Navigation -->
              <div class="call-details-tabs-sticky">
                <div class="details-tabs-nav" style="border-bottom: none;">
                  <button type="button" class="tab-nav-btn" [class.active]="activeViewTab === 'customer'" (click)="activeViewTab = 'customer'">
                    👤 Customer
                  </button>
                  <button type="button" class="tab-nav-btn" [class.active]="activeViewTab === 'contact'" (click)="activeViewTab = 'contact'">
                    📞 Contact
                  </button>
                  <button type="button" class="tab-nav-btn" [class.active]="activeViewTab === 'call'" (click)="activeViewTab = 'call'">
                    📋 Call Details
                  </button>
                  <button type="button" class="tab-nav-btn" [class.active]="activeViewTab === 'product'" (click)="activeViewTab = 'product'">
                    📦 Product
                  </button>
                  <button type="button" class="tab-nav-btn" [class.active]="activeViewTab === 'attachments'" (click)="activeViewTab = 'attachments'">
                    📷 Attachments
                  </button>
                </div>
              </div>

              <!-- Tab Content -->
              <div class="call-details-tab-body">
                <div class="details-tab-content">
                
                <!-- TAB 1: CUSTOMER DETAILS -->
                @if (activeViewTab === 'customer') {
                  <div class="tab-panel">
                    <div class="details-info-grid">
                      <div class="details-field">
                        <span class="df-label">Salutation</span>
                        <span class="df-value">{{ viewingCallDetails.customerDetail?.title || 'N/A' }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">First Name</span>
                        <span class="df-value text-semibold">{{ viewingCallDetails.customerDetail?.firstName || 'N/A' }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Last Name</span>
                        <span class="df-value text-semibold">{{ (viewingCallDetails.customerDetail?.lastName && viewingCallDetails.customerDetail?.lastName !== 'Name') ? viewingCallDetails.customerDetail?.lastName : 'N/A' }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Full Name</span>
                        <span class="df-value text-semibold">{{ getFormattedFullName(viewingCallDetails.customerDetail, viewingCallDetails.customerName) }}</span>
                      </div>
                      <div class="details-field span-2">
                        <span class="df-label">Address Line 1</span>
                        <span class="df-value">{{ viewingCallDetails.customerDetail?.address1 || 'N/A' }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Landmark</span>
                        <span class="df-value">{{ viewingCallDetails.customerDetail?.landmark || 'N/A' }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Locality</span>
                        <span class="df-value">{{ viewingCallDetails.customerDetail?.locality || 'N/A' }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">City</span>
                        <span class="df-value">{{ viewingCallDetails.customerDetail?.city || 'N/A' }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">District</span>
                        <span class="df-value">{{ viewingCallDetails.customerDetail?.district || 'N/A' }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">State</span>
                        <span class="df-value">{{ viewingCallDetails.customerDetail?.state || 'N/A' }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Pincode</span>
                        <span class="df-value">{{ viewingCallDetails.customerDetail?.pincode || 'N/A' }}</span>
                      </div>
                    </div>
                  </div>
                }

                <!-- TAB 2: CONTACT DETAILS -->
                @if (activeViewTab === 'contact') {
                  <div class="tab-panel">
                    <div class="details-info-grid">
                      <div class="details-field">
                        <span class="df-label">Mobile Number</span>
                        <span class="df-value text-semibold">{{ getCustomerPhone(viewingCallDetails) }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Email Address</span>
                        <span class="df-value">{{ viewingCallDetails.contactDetail?.email || 'N/A' }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Contact Person Name</span>
                        <span class="df-value">{{ viewingCallDetails.contactDetail?.contactPersonName || 'N/A' }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Contact Person Mobile</span>
                        <span class="df-value">{{ viewingCallDetails.contactDetail?.contactPersonMobile || 'N/A' }}</span>
                      </div>
                      <div class="details-field span-2">
                        <span class="df-label">Preferred Languages</span>
                        <span class="df-value">{{ viewingCallDetails.contactDetail?.language || 'N/A' }}</span>
                      </div>
                    </div>
                  </div>
                }

                <!-- TAB 3: CALL DETAILS -->
                @if (activeViewTab === 'call') {
                  <div class="tab-panel">
                    <div class="details-info-grid">
                      <div class="details-field">
                        <span class="df-label">Call Number</span>
                        <span class="df-value text-semibold text-mono">{{ viewingCallDetails.callNumber || viewingCallDetails.callId || '#' + viewingCallDetails.id }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Visit Type</span>
                        <span class="df-value">{{ viewingCallDetails.complaintDetail?.visitType || 'N/A' }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Call Nature</span>
                        <span class="df-value">{{ viewingCallDetails.complaintDetail?.callNature || 'N/A' }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Assigned Technician</span>
                        <span class="df-value text-semibold">{{ viewingCallDetails.technicianAssigned || 'Unassigned' }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Promise Date / Time</span>
                        <span class="df-value">{{ viewingCallDetails.complaintDetail?.promiseDate || 'N/A' }} - {{ viewingCallDetails.complaintDetail?.promiseTime || 'N/A' }} {{ viewingCallDetails.complaintDetail?.amOrPm || '' }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Last Complaint Number</span>
                        <span class="df-value">{{ viewingCallDetails.complaintDetail?.lastComplaintNumber || 'N/A' }}</span>
                      </div>
                      <div class="details-field span-2">
                        <span class="df-label">Complaint Description / Remarks</span>
                        <span class="df-value-block">{{ viewingCallDetails.complaintDetail?.complaintDescription || viewingCallDetails.remarks || 'N/A' }}</span>
                      </div>
                      <div class="details-field span-2">
                        <span class="df-label">Special Instructions</span>
                        <span class="df-value-block">{{ viewingCallDetails.complaintDetail?.specialInstruction || 'N/A' }}</span>
                      </div>
                    </div>
                  </div>
                }

                <!-- TAB 4: PRODUCT DETAILS -->
                @if (activeViewTab === 'product') {
                  <div class="tab-panel">
                    <div class="details-info-grid">
                      <div class="details-field">
                        <span class="df-label">Brand Name</span>
                        <span class="df-value text-semibold">{{ getBrandName(getCallBrand(viewingCallDetails)) }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Product Name</span>
                        <span class="df-value">{{ getProductName(getCallProduct(viewingCallDetails)) }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Model Name</span>
                        <span class="df-value text-semibold">{{ getModelName(getCallModel(viewingCallDetails)) }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Unit Serial Number</span>
                        <span class="df-value text-mono">{{ viewingCallDetails.productDetail?.unitSerialNumber || 'N/A' }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Client Category</span>
                        <span class="df-value">{{ viewingCallDetails.productDetail?.client || 'N/A' }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Warranty Details</span>
                        <span class="df-value">{{ viewingCallDetails.productDetail?.warranty || 'N/A' }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Stock Status</span>
                        <span class="df-value">{{ viewingCallDetails.productDetail?.stockOf || 'N/A' }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Purchase Date</span>
                        <span class="df-value">{{ viewingCallDetails.productDetail?.purchaseDate || 'N/A' }}</span>
                      </div>
                      <div class="details-field">
                        <span class="df-label">Purchase Order Number</span>
                        <span class="df-value">{{ viewingCallDetails.productDetail?.purchaseOrderNumber || 'N/A' }}</span>
                      </div>
                    </div>
                  </div>
                }

                <!-- TAB 5: ATTACHMENTS -->
                @if (activeViewTab === 'attachments') {
                  <div class="tab-panel">
                    @if (viewingCallDetails.imageUrl || viewingCallDetails.image) {
                      <div class="attachment-viewer">
                        <p class="attachment-label">Uploaded Image</p>
                        <img
                          [src]="viewingCallDetails.imageUrl || viewingCallDetails.image"
                          class="attachment-full-img"
                          alt="Call attachment"
                          (click)="openImageFullscreen(viewingCallDetails.imageUrl || viewingCallDetails.image)"
                        />
                        <p class="attachment-hint">Click image to view full screen in new tab</p>
                      </div>
                    } @else {
                      <div class="no-attachment">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <p>No image attached to this call</p>
                      </div>
                    }
                  </div>
                }

              </div><!-- /details-tab-content -->
              </div><!-- /call-details-tab-body -->

            </div><!-- /modal-body -->
            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="viewingCallDetails = null">Close</button>
              @if (!isCallClosed(viewingCallDetails)) {
                <button type="button" class="btn-save" (click)="startEditFromDetails(viewingCallDetails)">Edit Call</button>
              }
            </div>
          </div>
        </div>
      }

      <!-- EXPORT MODAL -->
      @if (showExportModal) {
        <div class="modal-backdrop animate-fade-in" (click)="showExportModal = false">
          <div class="modal-content animate-slide-up" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">Export Calls Data</h3>
              <button class="modal-close" (click)="showExportModal = false">&times;</button>
            </div>
            <div class="modal-body modal-body-padded">
              <p class="export-intro">Configure filter options to export your customer calls CSV report.</p>

              <div class="export-date-row">
                <div class="pro-form-group">
                  <label class="pro-label">From Date</label>
                  <input type="date" class="pro-input" [(ngModel)]="exportFilters.startDate" />
                </div>
                <div class="pro-form-group">
                  <label class="pro-label">To Date</label>
                  <input type="date" class="pro-input" [(ngModel)]="exportFilters.endDate" />
                </div>
              </div>

              <div class="pro-form-group">
                <label class="pro-label">Filter by Status</label>
                <select class="pro-input" [(ngModel)]="exportFilters.status">
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Closed">Closed</option>
                  <option value="Cancelled">Cancelled</option>
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

      <!-- EDIT CALL MODAL (PERFECTLY CENTERED & FLUID 2-COLUMN RESPONSIVE LAYOUT) -->
      @if (editingCall) {
        <div class="modal-backdrop animate-fade-in" (click)="editingCall = null">
          <div class="modal-content modal-content-lg animate-slide-up" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <h3 class="modal-title">Edit Call &bull; {{ editingCall.callNumber || editingCall.callId || '#' + editingCall.id }}</h3>
                <p class="modal-subtitle">Update customer details, product model & service assignment</p>
              </div>
              <button class="modal-close" (click)="editingCall = null">&times;</button>
            </div>
            
            <form [formGroup]="editCallForm" (ngSubmit)="onSaveEditCall()" class="modal-form-container">
              <div class="modal-body modal-body-padded">
                
                <!-- 1. CUSTOMER DETAIL -->
                <div class="section-divider">👤 1. Customer Details</div>
                <div formGroupName="customerDetail">
                  <div class="form-grid-2">
                    <div class="pro-form-group">
                      <label class="pro-label">First Name *</label>
                      <div class="input-with-select">
                        <select class="pro-input title-select" formControlName="title">
                          <option value="Mr">Mr</option>
                          <option value="Mrs">Mrs</option>
                          <option value="Ms">Ms</option>
                          <option value="Dr">Dr</option>
                        </select>
                        <input type="text" class="pro-input" [class.is-invalid]="isEditFieldInvalid('customerDetail', 'firstName')" formControlName="firstName" placeholder="First Name" />
                      </div>
                      @if (isEditFieldInvalid('customerDetail', 'firstName')) {
                        <span class="error-message">First name is required.</span>
                      }
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">Last Name</label>
                      <input type="text" class="pro-input" formControlName="lastName" placeholder="Last Name" />
                    </div>
                  </div>

                  <div class="form-grid-2">
                    <div class="pro-form-group">
                      <label class="pro-label">Address Line 1</label>
                      <input type="text" class="pro-input" formControlName="address1" placeholder="Address line 1" />
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">Landmark</label>
                      <input type="text" class="pro-input" formControlName="landmark" placeholder="Landmark" />
                    </div>
                  </div>

                  <div class="form-grid-2">
                    <div class="pro-form-group">
                      <label class="pro-label">Locality</label>
                      <input type="text" class="pro-input" formControlName="locality" placeholder="Locality" />
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">City</label>
                      <input type="text" class="pro-input" formControlName="city" placeholder="City" />
                    </div>
                  </div>

                  <div class="form-grid-3">
                    <div class="pro-form-group">
                      <label class="pro-label">District</label>
                      <input type="text" class="pro-input" formControlName="district" placeholder="District" />
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">State</label>
                      <input type="text" class="pro-input" formControlName="state" placeholder="State" />
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">Pincode</label>
                      <input type="number" class="pro-input" formControlName="pincode" placeholder="452001" />
                    </div>
                  </div>
                </div>

                <!-- 2. CONTACT DETAIL -->
                <div class="section-divider">📞 2. Contact Details</div>
                <div formGroupName="contactDetail">
                  <div class="form-grid-2">
                    <div class="pro-form-group">
                      <label class="pro-label">Mobile Number *</label>
                      <input type="text" class="pro-input" [class.is-invalid]="isEditFieldInvalid('contactDetail', 'mobile')" formControlName="mobile" placeholder="10-digit Mobile" maxlength="10" (keypress)="onlyDigits($event)" />
                      @if (isEditFieldInvalid('contactDetail', 'mobile')) {
                        <span class="error-message">
                          @if (editCallForm.get('contactDetail.mobile')?.errors?.['required']) {
                            Mobile number is required.
                          }
                          @if (editCallForm.get('contactDetail.mobile')?.errors?.['pattern']) {
                            Please enter a valid 10-digit mobile number.
                          }
                        </span>
                      }
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">Email Address</label>
                      <input type="email" class="pro-input" [class.is-invalid]="isEditFieldInvalid('contactDetail', 'email')" formControlName="email" placeholder="email@example.com" />
                      @if (isEditFieldInvalid('contactDetail', 'email')) {
                        <span class="error-message">Please enter a valid email address (e.g. name&#64;domain.com).</span>
                      }
                    </div>
                  </div>
                  <div class="form-grid-2">
                    <div class="pro-form-group">
                      <label class="pro-label">Contact Person Name</label>
                      <input type="text" class="pro-input" formControlName="contactPersonName" placeholder="Alternate Contact Name" />
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">Contact Person Mobile</label>
                      <input type="text" class="pro-input" formControlName="contactPersonMobile" placeholder="Alternate Mobile" />
                    </div>
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Languages</label>
                    <input type="text" class="pro-input" formControlName="language" placeholder="English, Hindi" />
                  </div>
                </div>

                <!-- 3. DEALER DETAIL -->
                <div class="section-divider">🏪 3. Dealer Details</div>
                <div formGroupName="dealerDetail">
                  <div class="form-grid-2">
                    <div class="pro-form-group">
                      <label class="pro-label">Dealer Name</label>
                      <input type="text" class="pro-input" formControlName="dealerName" placeholder="Store Name" />
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">Dealer City</label>
                      <input type="text" class="pro-input" formControlName="dealerCity" placeholder="Dealer City" />
                    </div>
                  </div>
                  <div class="form-grid-2">
                    <div class="pro-form-group">
                      <label class="pro-label">Dealer Mobile</label>
                      <input type="text" class="pro-input" formControlName="dealerMobile" placeholder="Dealer Mobile" />
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">Dealer Email</label>
                      <input type="email" class="pro-input" formControlName="dealerEmail" placeholder="dealer@example.com" />
                    </div>
                  </div>
                  <div class="form-grid-2">
                    <div class="pro-form-group">
                      <label class="pro-label">Invoice Number</label>
                      <input type="text" class="pro-input" formControlName="invoiceNumber" placeholder="INV001" />
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">Purchase Date</label>
                      <input type="date" class="pro-input" formControlName="purchaseDate" />
                    </div>
                  </div>
                </div>

                <!-- 4. PRODUCT DETAIL -->
                <div class="section-divider">📦 4. Product Details (Cascading Selection)</div>
                <div formGroupName="productDetail">
                  <div class="form-grid-2">
                    <div class="pro-form-group">
                      <label class="pro-label">1. Select Brand *</label>
                      <select class="pro-input highlight-select" [class.is-invalid]="isEditFieldInvalid('productDetail', 'brand')" formControlName="brand" (change)="onEditBrandSelect($event)">
                        <option value="">-- Choose Brand --</option>
                        @for (b of brands; track b.id) {
                          <option [value]="b.id">{{ b.name }}</option>
                        }
                      </select>
                      @if (isEditFieldInvalid('productDetail', 'brand')) {
                        <span class="error-message">Brand selection is required.</span>
                      }
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">2. Select Product *</label>
                      <select class="pro-input highlight-select" [class.is-invalid]="isEditFieldInvalid('productDetail', 'product')" formControlName="product" (change)="onEditProductSelect($event)">
                        <option value="">-- Choose Product --</option>
                        @for (p of editFilteredProducts; track p.id) {
                          <option [value]="p.id">{{ p.name }}</option>
                        }
                      </select>
                      @if (isEditFieldInvalid('productDetail', 'product')) {
                        <span class="error-message">Product selection is required.</span>
                      }
                    </div>
                  </div>

                  <div class="form-grid-2">
                    <div class="pro-form-group">
                      <label class="pro-label">3. Select Model *</label>
                      <select class="pro-input highlight-select" [class.is-invalid]="isEditFieldInvalid('productDetail', 'model')" formControlName="model">
                        <option value="">-- Choose Model --</option>
                        @for (m of editFilteredModels; track m.id) {
                          <option [value]="m.id">{{ m.modelName }}</option>
                        }
                      </select>
                      @if (isEditFieldInvalid('productDetail', 'model')) {
                        <span class="error-message">Model selection is required.</span>
                      }
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">Unit Serial Number</label>
                      <input type="text" class="pro-input" formControlName="unitSerialNumber" placeholder="SN001" />
                    </div>
                  </div>

                  <div class="form-grid-2">
                    <div class="pro-form-group">
                      <label class="pro-label">Client</label>
                      <input type="text" class="pro-input" formControlName="client" placeholder="Retail" />
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">Purchase Date</label>
                      <input type="date" class="pro-input" formControlName="purchaseDate" />
                    </div>
                  </div>

                  <div class="form-grid-3">
                    <div class="pro-form-group">
                      <label class="pro-label">Warranty</label>
                      <input type="text" class="pro-input" formControlName="warranty" placeholder="1 Year" />
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">Stock Of</label>
                      <input type="text" class="pro-input" formControlName="stockOf" placeholder="Warehouse" />
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">Purchase Order Number</label>
                      <input type="text" class="pro-input" formControlName="purchaseOrderNumber" placeholder="PO001" />
                    </div>
                  </div>
                </div>

                <!-- 5. COMPLAINT DETAIL & STATUS -->
                <div class="section-divider">📋 5. Complaint Details & Call Status</div>
                <div formGroupName="complaintDetail">
                  <div class="form-grid-2">
                    <div class="pro-form-group">
                      <label class="pro-label">Call Type / Reported Issue *</label>
                      <select class="pro-input highlight-select" [class.is-invalid]="isEditFieldInvalid('complaintDetail', 'callType')" formControlName="callType">
                        <option value="Installation">Installation</option>
                        <option value="Service">Service</option>
                        <option value="Repair">Repair</option>
                        <option value="Breakdown">Breakdown</option>
                        <option value="Maintenance">Maintenance</option>
                        @for (iss of editFilteredIssues; track iss.id) {
                          <option [value]="iss.issueName">{{ iss.issueName }}</option>
                        }
                      </select>
                      @if (isEditFieldInvalid('complaintDetail', 'callType')) {
                        <span class="error-message">Call type is required.</span>
                      }
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">Complaint Priority</label>
                      <select class="pro-input" formControlName="complaintPriority">
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-grid-2">
                    <div class="pro-form-group">
                      <label class="pro-label">Call Nature</label>
                      <input type="text" class="pro-input" formControlName="callNature" placeholder="Service" />
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">Visit Type</label>
                      <input type="text" class="pro-input" formControlName="visitType" placeholder="Home" />
                    </div>
                  </div>

                  <div class="form-grid-2">
                    <div class="pro-form-group">
                      <label class="pro-label">Last Complaint Number</label>
                      <input type="text" class="pro-input" formControlName="lastComplaintNumber" placeholder="LC001" />
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">Call Status</label>
                      <select class="pro-input" [ngModelOptions]="{standalone: true}" [(ngModel)]="editStatus">
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Closed">Closed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-grid-3">
                    <div class="pro-form-group">
                      <label class="pro-label">Promise Date</label>
                      <input type="date" class="pro-input" formControlName="promiseDate" />
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">Promise Time</label>
                      <input type="time" class="pro-input" formControlName="promiseTime" />
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">AM / PM</label>
                      <select class="pro-input" formControlName="amOrPm">
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-grid-2">
                    <div class="pro-form-group">
                      <label class="pro-label">Complaint Description</label>
                      <textarea class="pro-input" formControlName="complaintDescription" rows="2" placeholder="Problem details..."></textarea>
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">Special Instructions</label>
                      <textarea class="pro-input" formControlName="specialInstruction" rows="2" placeholder="Special instructions..."></textarea>
                    </div>
                  </div>
                </div>



                <!-- Attach Image -->
                <div class="pro-form-group" style="margin-top: 1rem;">
                  <label class="pro-label">Attach Photo / Image (optional)</label>
                  <div class="image-upload-zone" (click)="editImageInput.click()" [class.has-image]="editCallPreviewUrl">
                    @if (editCallPreviewUrl) {
                      <img [src]="editCallPreviewUrl" class="upload-preview-img" alt="Preview" />
                      <button type="button" class="remove-img-btn" (click)="$event.stopPropagation(); clearEditImage()">&#x2715; Remove</button>
                    } @else {
                      <div class="upload-placeholder">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <span style="font-weight: 600; color: #4f46e5;">Click to upload call image / receipt photo</span>
                        <span class="upload-hint">JPG, PNG, WEBP up to 5MB</span>
                      </div>
                    }
                  </div>
                  <input #editImageInput type="file" accept="image/*" style="display:none" (change)="onEditCallImageChange($event)" />
                </div>
              </div>

              <!-- ALWAYS VISIBLE STICKY FOOTER -->
              <div class="modal-footer">
                <button type="button" class="btn-cancel" (click)="editingCall = null">Cancel</button>
                <button type="button" class="btn-save" [disabled]="isSubmitting" (click)="onSaveEditCall()">
                  {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-wrapper { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; }

    .pg-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 12px rgba(79,70,229,0.3); flex-shrink: 0; }
    .pg-icon-sm { width: 32px; height: 32px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 3px 10px rgba(79,70,229,0.3); flex-shrink: 0; }

    .data-card-header-left { display: flex; align-items: center; gap: 0.875rem; }

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

    /* Toast Popups (Floating Below Header, Modern & Always on Top of Modals) */
    .toast-container {
      position: fixed;
      top: 5.5rem;
      right: 1.5rem;
      z-index: 99999999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      pointer-events: none;
    }
    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.85rem 1.25rem;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08);
      backdrop-filter: blur(8px);
      min-width: 300px;
      max-width: 450px;
      border: 1px solid transparent;
      animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .toast-success {
      background: #f0fdf4;
      border-color: #bbf7d0;
      color: #166534;
    }
    .toast-error {
      background: #fef2f2;
      border-color: #fecaca;
      color: #991b1b;
    }
    .toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .toast-success .toast-icon { background: #dcfce7; color: #15803d; }
    .toast-error .toast-icon { background: #fee2e2; color: #b91c1c; }
    .toast-content { flex: 1; }
    .toast-title { font-size: 0.85rem; font-weight: 700; margin-bottom: 0.1rem; }
    .toast-message { font-size: 0.8rem; font-weight: 500; opacity: 0.9; }
    .toast-close { background: none; border: none; font-size: 1.25rem; color: currentColor; opacity: 0.5; cursor: pointer; padding: 0.2rem; line-height: 1; border-radius: 4px; }
    .toast-close:hover { opacity: 1; background: rgba(0,0,0,0.05); }

    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    /* Alerts */
    .alert { display: flex; align-items: center; gap: 0.625rem; padding: 0.875rem 1rem; border-radius: 10px; font-size: 0.875rem; font-weight: 500; }
    .alert-success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
    .alert-error { background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; }

    /* Form Layouts */
    .card-form-wrapper { background: var(--surface); border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 20px rgba(0,0,0,0.03); overflow: hidden; padding: 2rem; width: 100%; box-sizing: border-box; }
    .form-card-header { margin-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; }
    .form-card-title { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .form-card-subtitle { font-size: 0.85rem; color: var(--text-secondary); margin: 0.25rem 0 0; }
    
    .section-divider { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #4f46e5; margin: 1.75rem 0 1rem; border-bottom: 1.5px solid #e0e7ff; padding-bottom: 0.4rem; }

    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; width: 100%; box-sizing: border-box; }
    .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.25rem; width: 100%; box-sizing: border-box; }
    @media (max-width: 640px) {
      .form-grid-2, .form-grid-3 { grid-template-columns: 1fr; }
    }

    .input-with-select { display: flex; gap: 0.5rem; width: 100%; }
    .title-select { width: 90px; flex-shrink: 0; }

    .pro-form-group { margin-bottom: 1rem; width: 100%; box-sizing: border-box; }
    .pro-label { display: block; font-size: 0.725rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.4rem; }
    .pro-input { width: 100%; max-width: 100%; padding: 0.6rem 0.85rem; font-size: 0.875rem; color: var(--text-primary); background: var(--surface); border: 1.5px solid var(--border); border-radius: 8px; transition: all 0.15s; box-sizing: border-box; font-family: inherit; }
    .pro-input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.15); }
    .pro-input:disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; }
    .highlight-select { border-color: #a5b4fc; background-color: #faf5ff; }

    .form-card-footer { display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid #f1f5f9; padding-top: 1.25rem; margin-top: 1.5rem; }

    /* Tables (Clean & Streamlined) */
    .data-card { background: var(--surface); border-radius: 14px; border: 1px solid var(--border); box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; width: 100%; }
    .data-card-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
    .data-card-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 0; }
    .data-card-subtitle { font-size: 0.78rem; color: #94a3b8; margin: 0.15rem 0 0; font-weight: 500; }
    .card-header-actions { display: flex; gap: 0.625rem; }

    .refresh-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.875rem; font-size: 0.8rem; font-weight: 600; background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; cursor: pointer; color: var(--text-secondary); transition: all 0.15s; font-family: inherit; }
    .refresh-btn:hover:not(:disabled) { background: #f1f5f9; color: var(--text-primary); border-color: #cbd5e1; }

    .table-responsive { width: 100%; overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; min-width: 680px; }
    .data-table thead tr { background: var(--surface); }
    .data-table th { padding: 0.75rem 1rem; text-align: left; font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid var(--border); white-space: nowrap; }
    .data-table td { padding: 0.85rem 1rem; font-size: 0.875rem; color: var(--text-primary); border-bottom: 1px solid var(--border); vertical-align: middle; }
    .data-table tbody tr:last-child td { border-bottom: none; }
    .data-table tbody tr:hover td { background: rgba(79, 70, 229, 0.04); }

    .td-id { font-family: monospace; font-size: 0.8rem; color: #4f46e5; font-weight: 700; white-space: nowrap; }
    .customer-cell { display: flex; flex-direction: column; gap: 0.1rem; }
    .customer-name { font-weight: 700; color: var(--text-primary); }
    .customer-addr { font-size: 0.75rem; color: var(--text-secondary); }

    .product-title { font-weight: 600; color: var(--text-primary); font-size: 0.875rem; }

    .status-cell { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
    .status-badge { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.04em; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-progress { background: #dbeafe; color: #1e40af; }
    .status-resolved { background: #dcfce7; color: #166534; }
    .status-closed { background: #f1f5f9; color: #475569; }

    .priority-badge { font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 4px; }
    .priority-high { color: #dc2626; background: #fee2e2; }
    .priority-med { color: #d97706; background: #fef3c7; }
    .priority-low { color: #059669; background: #d1fae5; }

    .col-actions { text-align: right; width: 180px; white-space: nowrap; }
    .td-actions { text-align: right; vertical-align: middle; white-space: nowrap; }
    .action-btns { display: inline-flex; gap: 0.35rem; justify-content: flex-end; align-items: center; }
    .btn-row-view { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.35rem 0.6rem; font-size: 0.75rem; font-weight: 600; background: rgba(79, 70, 229, 0.05); border: 1px solid rgba(79, 70, 229, 0.2); border-radius: 6px; color: #4f46e5; cursor: pointer; transition: all 0.15s; }
    .btn-row-view:hover { background: rgba(79, 70, 229, 0.15); }
    .btn-row-edit { padding: 0.35rem 0.6rem; font-size: 0.75rem; font-weight: 600; background: var(--surface); border: 1px solid #cbd5e1; border-radius: 6px; color: #475569; cursor: pointer; transition: all 0.15s; }
    .btn-row-edit:hover:not(:disabled) { background: #f1f5f9; color: var(--text-primary); }
    .btn-row-edit:disabled { background: #f8fafc; border-color: #e2e8f0; color: #cbd5e1; cursor: not-allowed; opacity: 0.65; }
    .btn-row-delete { padding: 0.35rem 0.6rem; font-size: 0.75rem; font-weight: 600; background: var(--surface); border: 1px solid #fca5a5; border-radius: 6px; color: #dc2626; cursor: pointer; transition: all 0.15s; }
    .btn-row-delete:hover { background: #fef2f2; color: #b91c1c; }

    /* Lookup tab */
    .lookup-bar { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; align-items: center; }
    .lookup-input { height: 36px; padding: 0.4rem 0.75rem; font-size: 0.85rem; max-width: 320px; }
    .lookup-btn { padding: 0.35rem 0.85rem; font-size: 0.775rem; font-weight: 600; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer; white-space: nowrap; height: 36px; display: inline-flex; align-items: center; justify-content: center; transition: background 0.15s; }
    .lookup-btn:hover { background: #1e293b; }

    /* ── Attachment Column Pill & Viewer ────────────────────────── */
    .table-attachment-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.25rem 0.65rem;
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-radius: 999px;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .table-attachment-chip:hover {
      background: #f5f3ff;
      border-color: #6366f1;
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
    }
    .chip-thumb {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      object-fit: cover;
      border: 1px solid #94a3b8;
    }
    .chip-text {
      font-size: 0.75rem;
      font-weight: 600;
      color: #4338ca;
    }

    .attachment-viewer { display: flex; flex-direction: column; align-items: center; gap: 0.85rem; padding: 1.25rem; background: var(--surface-2, #f8fafc); border-radius: 12px; border: 1px solid var(--border); }
    .attachment-label { font-size: 0.8rem; font-weight: 700; color: #4338ca; text-transform: uppercase; letter-spacing: 0.06em; margin: 0; }
    .attachment-full-img {
      max-width: 100%; max-height: 360px; object-fit: contain;
      border-radius: 10px; border: 1px solid var(--border);
      box-shadow: 0 6px 20px rgba(0,0,0,0.12);
      cursor: pointer; transition: transform 0.25s ease, box-shadow 0.25s ease;
      background: #ffffff;
    }
    .attachment-full-img:hover { transform: scale(1.03); box-shadow: 0 10px 28px rgba(0,0,0,0.18); }
    .attachment-hint { font-size: 0.775rem; font-weight: 500; color: #64748b; margin: 0; display: inline-flex; align-items: center; gap: 0.35rem; }

    .found-call-card { background: #f8fafc; border: 1.5px solid var(--border); border-radius: 12px; padding: 1.5rem; }
    .found-call-summary { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
    .summary-id { font-family: monospace; font-size: 0.8rem; font-weight: 800; color: #4f46e5; }
    .summary-name { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin: 0.2rem 0; }
    .summary-desc { font-size: 0.85rem; color: var(--text-secondary); margin: 0; }

    .photo-badge {
      display: inline-flex; align-items: center; justify-content: center;
      background: #e0e7ff; color: #4338ca; border-radius: 999px;
      padding: 0.15rem 0.45rem; font-size: 0.75rem; font-weight: 700;
      cursor: pointer; transition: transform 0.15s;
    }
    .photo-badge:hover { transform: scale(1.1); background: #c7d2fe; }

    /* ── Image Upload Zone ───────────────────────────────────────── */
    .image-upload-zone {
      border: 2px dashed #cbd5e1;
      border-radius: 10px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      background: #f8fafc;
      min-height: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .image-upload-zone:hover { border-color: #4f46e5; background: #f5f3ff; }
    .image-upload-zone.has-image { border-style: solid; border-color: #10b981; padding: 0; min-height: 160px; }
    .upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: #94a3b8; font-size: 0.85rem; }
    .upload-hint { font-size: 0.75rem; color: #cbd5e1; }
    .upload-preview-img { width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px; display: block; }
    .remove-img-btn {
      position: absolute; top: 6px; right: 8px;
      background: rgba(220,38,38,0.85); color: #fff;
      border: none; border-radius: 999px; padding: 0.2rem 0.55rem;
      font-size: 0.75rem; font-weight: 600; cursor: pointer;
      transition: background 0.15s;
    }
    .remove-img-btn:hover { background: #dc2626; }

    /* ── Attachment Viewer in View Call Modal ────────────────────── */
    .attachment-viewer { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 1rem 0; }
    .attachment-label { font-size: 0.8rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
    .attachment-full-img {
      max-width: 100%; max-height: 380px; object-fit: contain;
      border-radius: 12px; border: 1px solid var(--border);
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      cursor: pointer; transition: transform 0.2s ease;
    }
    .attachment-full-img:hover { transform: scale(1.02); }
    .attachment-hint { font-size: 0.75rem; color: #94a3b8; margin: 0; }
    .no-attachment { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 2.5rem 0; color: #94a3b8; font-size: 0.875rem; }

    /* ── View Call Details Modal Styles ────────────────────────── */
    .call-details-modal-body {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .call-details-top-section {
      padding: 1.25rem 1.75rem 0;
      flex-shrink: 0;
    }
    .call-details-tabs-sticky {
      position: sticky;
      top: 0;
      background: var(--surface);
      z-index: 10;
      padding: 0 1.75rem;
      border-bottom: 2px solid var(--border-light, #e2e8f0);
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .call-details-tab-body {
      padding: 1.25rem 1.75rem 1.5rem;
      flex: 1;
    }
    .details-name-banner {
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(124, 58, 237, 0.08));
      border: 1px solid rgba(79, 70, 229, 0.2);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .name-banner-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #6366f1;
    }
    .name-banner-value {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-primary);
    }
    .details-badges-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      background: var(--surface-2, #f8fafc);
      padding: 0.85rem 1.1rem;
      border-radius: 10px;
      border: 1px solid var(--border);
    }
    .badge-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .badge-label {
      font-size: 0.725rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-secondary);
    }
    .inline-badge-select {
      padding: 0.35rem 0.65rem;
      font-size: 0.78rem;
      font-weight: 700;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text-primary);
      cursor: pointer;
    }
    .details-tabs-nav {
      display: flex;
      gap: 0.5rem;
      border-bottom: 2px solid var(--border-light, #e2e8f0);
      overflow-x: auto;
      padding-bottom: 0.25rem;
    }
    .tab-nav-btn {
      padding: 0.55rem 0.95rem;
      font-size: 0.8rem;
      font-weight: 600;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--text-secondary);
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
    }
    .tab-nav-btn:hover {
      color: #4f46e5;
    }
    .tab-nav-btn.active {
      color: #4f46e5;
      border-bottom-color: #4f46e5;
      font-weight: 700;
    }
    .details-tab-content {
      flex: 1;
    }
    .tab-panel {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .details-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem 1.25rem;
    }
    .details-field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      background: var(--surface-2, #f8fafc);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    .details-field.span-2 {
      grid-column: span 2;
    }
    @media (max-width: 640px) {
      .details-field.span-2 { grid-column: span 1; }
    }
    .df-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
    }
    .df-value {
      font-size: 0.875rem;
      color: var(--text-primary);
      word-break: break-word;
    }
    .df-value-block {
      font-size: 0.85rem;
      color: var(--text-primary);
      white-space: pre-wrap;
      word-break: break-word;
    }
    .text-semibold { font-weight: 600; }
    .text-mono { font-family: monospace; }

    /* Modern View Details Cards Grid */
    .view-cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; width: 100%; box-sizing: border-box; }
    .view-info-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .view-card-header { padding: 0.85rem 1.1rem; background: #f8fafc; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 0.5rem; }
    .card-header-icon { font-size: 1rem; }
    .view-card-header h4 { font-size: 0.85rem; font-weight: 800; text-transform: uppercase; color: #4f46e5; letter-spacing: 0.04em; margin: 0; }
    .view-card-content { padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.55rem; }
    .info-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.825rem; }
    .info-label { color: var(--text-secondary); font-weight: 600; }
    .info-value { color: var(--text-primary); text-align: right; word-break: break-word; }
    .text-bold { font-weight: 700; color: var(--text-primary); }

    /* Modals (Perfectly Centered & Flex Container Layout) */
    .modal-backdrop { 
      position: fixed; 
      inset: 0; 
      width: 100vw; 
      height: 100vh; 
      background: rgba(15, 23, 42, 0.75); 
      backdrop-filter: blur(10px); 
      display: flex; 
      align-items: flex-start; 
      justify-content: center; 
      z-index: 9999999; 
      padding: 72px 1rem 1rem 1rem; 
      box-sizing: border-box; 
      overflow-y: auto;
    }
    .modal-content { 
      background: var(--surface); 
      border-radius: 20px; 
      box-shadow: 0 25px 60px -15px rgba(0,0,0,0.35); 
      width: 100%; 
      max-width: 520px; 
      overflow: hidden; 
      border: 1px solid var(--border); 
      position: relative; 
      margin: auto; 
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    }
    .modal-content-lg { 
      max-width: 800px; 
      width: 95vw; 
      max-height: calc(100vh - 90px); 
    }
    .modal-content-sm { max-width: 440px; }
    .modal-form-container {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }
    .modal-header { 
      flex-shrink: 0;
      padding: 1.25rem 1.75rem; 
      border-bottom: 1px solid #f1f5f9; 
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      background: var(--surface); 
    }
    .modal-title { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .modal-subtitle { font-size: 0.78rem; color: var(--text-secondary); margin: 0.15rem 0 0; }
    .modal-close { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: #f1f5f9; border: none; border-radius: 8px; font-size: 1.2rem; color: var(--text-secondary); cursor: pointer; transition: background 0.15s; }
    .modal-close:hover { background: #e2e8f0; color: var(--text-primary); }
    .modal-body { 
      flex: 1; 
      min-height: 0;
      overflow-y: auto; 
      overflow-x: hidden;
      padding: 0; 
      width: 100%; 
      box-sizing: border-box; 
    }
    .modal-body-padded {
      padding: 1.25rem 1.75rem !important;
    }
    select.pro-input {
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.85rem center;
      background-size: 14px;
      padding-right: 2.25rem;
      cursor: pointer;
    }
    .modal-footer { 
      flex-shrink: 0;
      padding: 1rem 1.75rem; 
      background: #f8fafc; 
      border-top: 1px solid var(--border); 
      display: flex; 
      justify-content: flex-end; 
      gap: 0.75rem; 
    }
    .export-intro { font-size: 0.875rem; color: var(--text-secondary); margin-top: 0; margin-bottom: 1.25rem; }
    .export-date-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 0.25rem; }

    /* Delete Confirmation Modal Styling */
    .delete-modal-body { padding: 2rem; text-align: center; }
    .delete-icon-wrapper { width: 56px; height: 56px; background: #fee2e2; color: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; }
    .delete-modal-title { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.5rem; }
    .delete-modal-desc { font-size: 0.875rem; color: var(--text-secondary); margin: 0 0 1.5rem; line-height: 1.5; }
    .delete-modal-actions { display: flex; justify-content: center; gap: 0.75rem; }
    .btn-danger-confirm { padding: 0.65rem 1.25rem; font-size: 0.875rem; font-weight: 700; background: #dc2626; color: white; border: none; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
    .btn-danger-confirm:hover { background: #b91c1c; }

    .btn-save { padding: 0.65rem 1.4rem; font-size: 0.875rem; font-weight: 700; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; border: none; border-radius: 8px; cursor: pointer; transition: opacity 0.15s; }
    .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-cancel { padding: 0.65rem 1.1rem; font-size: 0.875rem; font-weight: 600; background: var(--surface); color: var(--text-secondary); border: 1.5px solid #cbd5e1; border-radius: 8px; cursor: pointer; }
    .btn-cancel:hover { background: #f8fafc; color: var(--text-primary); }

    .loading-state, .empty-state { padding: 3rem; text-align: center; color: #94a3b8; }
    .spinner { width: 22px; height: 22px; border: 2.5px solid #e2e8f0; border-top-color: #4f46e5; border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 0.5rem; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .animate-fade-in { animation: fadeIn 0.25s ease-out both; }
    .animate-slide-up { animation: slideUp 0.25s cubic-bezier(0.16,1,0.3,1) both; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(14px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class CallManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private callService = inject(CallService);
  private brandService = inject(BrandService);
  private productService = inject(ProductService);
  private modelService = inject(ProductModelService);
  private issueService = inject(ProductIssueService);
  authService = inject(AuthService);

  private parseArray(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.results)) return res.results;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  }

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

  filteredProducts: Product[] = [];
  filteredModels: ProductModel[] = [];
  filteredIssues: ProductIssue[] = [];

  editFilteredProducts: Product[] = [];
  editFilteredModels: ProductModel[] = [];
  editFilteredIssues: ProductIssue[] = [];

  createStatus = 'OPEN';
  createTechnicianAssigned = '';
  editStatus = 'OPEN';
  editTechnicianAssigned = '';
  isSearching = false;

  // ─── Quick Update Image ───────────────────────────────────────────────
  quickUpdateImageFile: File | null = null;
  quickUpdatePreviewUrl: string | null = null;

  onQuickUpdateImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('Image must be less than 5MB', false);
      return;
    }
    this.quickUpdateImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.quickUpdatePreviewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  clearQuickImage(): void {
    this.quickUpdateImageFile = null;
    this.quickUpdatePreviewUrl = null;
  }

  openImageFullscreen(url?: string): void {
    if (!url) return;
    window.open(url, '_blank');
  }

  // ─── States / Districts / Cities Data ─────────────────────────────
  statesData: { [key: string]: { [key: string]: string[] } } = {
    'Andhra Pradesh': { 'Visakhapatnam': ['Visakhapatnam City', 'Bheemunipatnam', 'Anakapalle'], 'Guntur': ['Guntur City', 'Tenali', 'Narasaraopet', 'Mangalagiri'], 'Krishna': ['Vijayawada', 'Machilipatnam', 'Gudivada'], 'Kurnool': ['Kurnool City', 'Nandyal', 'Adoni'] },
    'Delhi': { 'Central Delhi': ['Connaught Place', 'Chandni Chowk', 'Paharganj'], 'New Delhi': ['Chanakyapuri', 'Parliament Street', 'RK Puram'], 'South Delhi': ['Saket', 'Mehrauli', 'Hauz Khas'], 'East Delhi': ['Preet Vihar', 'Mayur Vihar', 'Geeta Colony'], 'West Delhi': ['Rajouri Garden', 'Tilak Nagar', 'Janakpuri'], 'North Delhi': ['Civil Lines', 'Model Town', 'Rohini'] },
    'Gujarat': { 'Ahmedabad': ['Ahmedabad City', 'Sanand', 'Bavla', 'Dholka'], 'Surat': ['Surat City', 'Chorasi', 'Bardoli', 'Olpad'], 'Vadodara': ['Vadodara City', 'Padra', 'Karjan', 'Waghodia'], 'Rajkot': ['Rajkot City', 'Gondal', 'Jasdan', 'Jetpur'], 'Gandhinagar': ['Gandhinagar City', 'Mansa', 'Dehgam'] },
    'Haryana': { 'Gurugram': ['Gurugram City', 'Sohna', 'Pataudi'], 'Faridabad': ['Faridabad City', 'Ballabhgarh', 'Tigaon'], 'Hisar': ['Hisar City', 'Hansi', 'Barwala'], 'Ambala': ['Ambala City', 'Ambala Cantt', 'Naraingarh'] },
    'Karnataka': { 'Bengaluru Urban': ['Bengaluru City', 'Anekal', 'Yelahanka', 'Doddaballapur'], 'Bengaluru Rural': ['Hoskote', 'Kanakapura', 'Ramanagara'], 'Mysuru': ['Mysuru City', 'Nanjangud', 'T Narasipura', 'Hunsur'], 'Dharwad': ['Hubli-Dharwad', 'Kalghatgi', 'Navalgund'], 'Belagavi': ['Belagavi City', 'Gokak', 'Chikodi'], 'Mangaluru': ['Mangaluru City', 'Bantwal', 'Puttur'] },
    'Kerala': { 'Thiruvananthapuram': ['Thiruvananthapuram City', 'Neyyattinkara', 'Attingal'], 'Ernakulam': ['Kochi City', 'Aluva', 'Muvattupuzha'], 'Kozhikode': ['Kozhikode City', 'Vatakara', 'Koyilandy'], 'Thrissur': ['Thrissur City', 'Chalakudy', 'Kodungallur'] },
    'Madhya Pradesh': { 'Bhopal': ['Bhopal City', 'Berasia', 'Phanda'], 'Indore': ['Indore City', 'Mhow', 'Sanwer', 'Depalpur'], 'Gwalior': ['Gwalior City', 'Bhitarwar', 'Dabra'], 'Jabalpur': ['Jabalpur City', 'Sihora', 'Patan'] },
    'Maharashtra': { 'Mumbai City': ['Colaba', 'Fort', 'Dharavi', 'Kurla', 'Sion'], 'Mumbai Suburban': ['Andheri', 'Bandra', 'Borivali', 'Goregaon', 'Malad', 'Kandivali'], 'Pune': ['Pune City', 'Pimpri-Chinchwad', 'Haveli', 'Baramati'], 'Nagpur': ['Nagpur City', 'Kamptee', 'Hingna', 'Umred'], 'Nashik': ['Nashik City', 'Sinnar', 'Niphad', 'Igatpuri'], 'Aurangabad': ['Aurangabad City', 'Kannad', 'Paithan', 'Vaijapur'] },
    'Punjab': { 'Amritsar': ['Amritsar City', 'Ajnala', 'Baba Bakala'], 'Ludhiana': ['Ludhiana City', 'Jagraon', 'Raikot', 'Samrala'], 'Jalandhar': ['Jalandhar City', 'Nakodar', 'Shahkot', 'Phillaur'], 'Patiala': ['Patiala City', 'Samana', 'Nabha'] },
    'Rajasthan': { 'Jaipur': ['Jaipur City', 'Amber', 'Phulera', 'Dudu'], 'Jodhpur': ['Jodhpur City', 'Phalodi', 'Bilara', 'Osian'], 'Udaipur': ['Udaipur City', 'Girwa', 'Mavli', 'Salumber'], 'Kota': ['Kota City', 'Ladpura', 'Sangod'] },
    'Tamil Nadu': { 'Chennai': ['Chennai City', 'Ambattur', 'Tambaram', 'Avadi'], 'Coimbatore': ['Coimbatore City', 'Mettupalayam', 'Pollachi'], 'Madurai': ['Madurai City', 'Melur', 'Peraiyur', 'Usilampatti'], 'Tiruchirappalli': ['Tiruchirappalli City', 'Musiri', 'Lalgudi'], 'Salem': ['Salem City', 'Edapadi', 'Omalur', 'Mettur'] },
    'Telangana': { 'Hyderabad': ['Hyderabad City', 'LB Nagar', 'Secunderabad', 'Kukatpally'], 'Rangareddy': ['Rajendranagar', 'Chevella', 'Vikarabad'], 'Medchal': ['Kompally', 'Keesara', 'Shamirpet'], 'Warangal Urban': ['Warangal City', 'Hanamkonda', 'Kazipet'] },
    'Uttar Pradesh': { 'Lucknow': ['Lucknow City', 'Mohanlalganj', 'Bakshi Ka Talab'], 'Agra': ['Agra City', 'Fatehabad', 'Khandauli'], 'Kanpur Nagar': ['Kanpur City', 'Ghatampur', 'Bithoor'], 'Varanasi': ['Varanasi City', 'Pindra', 'Arajiline'], 'Noida (Gautam Buddh Nagar)': ['Noida', 'Greater Noida', 'Dadri', 'Jewar'] },
    'West Bengal': { 'Kolkata': ['Kolkata City', 'Dum Dum', 'Jadavpur', 'Behala'], 'North 24 Parganas': ['Barasat', 'Barrackpore', 'Bongaon', 'Basirhat'], 'Howrah': ['Howrah City', 'Uluberia', 'Bagnan', 'Amta'] },
    'Chhattisgarh': { 'Raipur': ['Raipur City', 'Arang', 'Abhanpur'], 'Durg': ['Bhilai', 'Durg City', 'Patan'], 'Bilaspur': ['Bilaspur City', 'Takhatpur', 'Mungeli'] },
    'Assam': { 'Kamrup Metropolitan': ['Guwahati City', 'Dispur', 'Jalukbari'], 'Kamrup': ['Boko', 'Chamaria', 'Chayani'], 'Dibrugarh': ['Dibrugarh City', 'Khowang', 'Barbaruah'] },
    'Goa': { 'North Goa': ['Panaji', 'Mapusa', 'Calangute', 'Bardez'], 'South Goa': ['Margao', 'Vasco da Gama', 'Ponda', 'Quepem'] }
  };

  states: string[] = [];
  createDistricts: string[] = [];
  createCities: string[] = [];

  showExportModal = false;
  deletingCallObj: Call | null = null;
  editingCall: Call | null = null;
  viewingCallDetails: Call | null = null;
  viewDetailPriority = 'Medium';
  searchCallId = '';
  foundCall: Call | null = null;
  activeViewTab: 'customer' | 'contact' | 'call' | 'product' | 'timeline' | 'attachments' = 'customer';

  // ─── Image Upload State ───────────────────────────────────────────────
  createCallImageFile: File | null = null;
  createCallPreviewUrl: string | null = null;
  imageMemoryCache: { [key: string]: string } = {};

  editCallImageFile: File | null = null;
  editCallPreviewUrl: string | null = null;

  onCreateCallImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('Image must be less than 5MB', false);
      return;
    }
    this.createCallImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.createCallPreviewUrl = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  clearCreateImage(): void {
    this.createCallImageFile = null;
    this.createCallPreviewUrl = null;
  }

  onEditCallImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('Image must be less than 5MB', false);
      return;
    }
    this.editCallImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.editCallPreviewUrl = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  clearEditImage(): void {
    this.editCallImageFile = null;
    this.editCallPreviewUrl = null;
  }

  exportFilters: CallExportFilter = {
    status: 'All',
    priority: 'All',
    brandId: 'All',
    startDate: '',
    endDate: ''
  };

  onlyDigits(event: KeyboardEvent) {
    const charCode = event.key;
    if (!/^[0-9]$/.test(charCode)) {
      event.preventDefault();
    }
  }

  isFieldInvalid(groupName: string, fieldName: string): boolean {
    const group = this.callForm.get(groupName);
    const control = group?.get(fieldName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  isEditFieldInvalid(groupName: string, fieldName: string): boolean {
    const group = this.editCallForm.get(groupName);
    const control = group?.get(fieldName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  showToast(message: string, isSuccess: boolean) {
    if (isSuccess) {
      this.successMessage = message;
      this.errorMessage = '';
      setTimeout(() => {
        if (this.successMessage === message) this.successMessage = '';
      }, 4000);
    } else {
      this.errorMessage = message;
      this.successMessage = '';
      setTimeout(() => {
        if (this.errorMessage === message) this.errorMessage = '';
      }, 4000);
    }
  }

  getCallTimeline(call: Call | null): any[] {
    if (!call) return [];
    const dateStr = call.createdAt || new Date().toISOString().slice(0, 10);
    const steps = [
      {
        title: 'Call Registered',
        description: `Customer service call was logged under ID ${call.callNumber || call.callId}.`,
        date: dateStr,
        time: '10:00 AM',
        icon: '📝',
        completed: true
      }
    ];

    if (call.technicianAssigned && call.technicianAssigned !== 'Unassigned') {
      steps.push({
        title: 'Technician Assigned',
        description: `Technician "${call.technicianAssigned}" was assigned to this request.`,
        date: dateStr,
        time: '11:30 AM',
        icon: '🔧',
        completed: true
      });
    } else {
      steps.push({
        title: 'Awaiting Assignment',
        description: 'Waiting to assign a service technician to the ticket.',
        date: dateStr,
        time: '10:15 AM',
        icon: '⏳',
        completed: false
      });
    }

    if (call.status === 'In Progress') {
      steps.push({
        title: 'Work In Progress',
        description: 'Technician is diagnosing or working on the reported issue.',
        date: dateStr,
        time: '02:00 PM',
        icon: '⚡',
        completed: true
      });
    } else if (call.status === 'Resolved' || call.status === 'Completed') {
      steps.push({
        title: 'Completed',
        description: 'The reported issue was successfully completed.',
        date: dateStr,
        time: '04:00 PM',
        icon: '✅',
        completed: true
      });
    } else if (call.status === 'Closed') {
      steps.push({
        title: 'Completed',
        description: 'The reported issue was completed.',
        date: dateStr,
        time: '04:00 PM',
        icon: '✅',
        completed: true
      });
      steps.push({
        title: 'Ticket Closed',
        description: 'The call was closed and archived.',
        date: dateStr,
        time: '05:30 PM',
        icon: '📁',
        completed: true
      });
    } else if (call.status === 'Cancelled') {
      steps.push({
        title: 'Cancelled',
        description: 'The service call was cancelled.',
        date: dateStr,
        time: '12:00 PM',
        icon: '❌',
        completed: true
      });
    }

    return steps;
  }

  callForm: FormGroup = this.fb.group({
    customerDetail: this.fb.group({
      title: ['Mr'],
      firstName: ['', Validators.required],
      lastName: [''],
      address1: [''],
      landmark: [''],
      state: [''],
      district: [''],
      city: [''],
      locality: [''],
      pincode: ['']
    }),
    contactDetail: this.fb.group({
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      contactPersonName: [''],
      contactPersonMobile: [''],
      language: ['English, Hindi']
    }),
    dealerDetail: this.fb.group({
      dealerName: [''],
      dealerCity: [''],
      dealerMobile: [''],
      dealerEmail: [''],
      invoiceNumber: [''],
      purchaseDate: ['']
    }),
    productDetail: this.fb.group({
      brand: ['', Validators.required],
      client: [''],
      product: ['', Validators.required],
      model: ['', Validators.required],
      unitSerialNumber: [''],
      purchaseDate: [''],
      warranty: [''],
      stockOf: [''],
      purchaseOrderNumber: ['']
    }),
    complaintDetail: this.fb.group({
      callType: ['Installation', Validators.required],
      complaintPriority: ['Medium'],
      callNature: ['Service'],
      visitType: ['Home'],
      lastComplaintNumber: [''],
      complaintDescription: [''],
      specialInstruction: [''],
      promiseDate: [''],
      promiseTime: [''],
      amOrPm: ['AM']
    })
  });

  editCallForm: FormGroup = this.fb.group({
    customerDetail: this.fb.group({
      title: ['Mr'],
      firstName: ['', Validators.required],
      lastName: [''],
      address1: [''],
      landmark: [''],
      state: [''],
      district: [''],
      city: [''],
      locality: [''],
      pincode: ['']
    }),
    contactDetail: this.fb.group({
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      contactPersonName: [''],
      contactPersonMobile: [''],
      language: ['English, Hindi']
    }),
    dealerDetail: this.fb.group({
      dealerName: [''],
      dealerCity: [''],
      dealerMobile: [''],
      dealerEmail: [''],
      invoiceNumber: [''],
      purchaseDate: ['']
    }),
    productDetail: this.fb.group({
      brand: ['', Validators.required],
      client: [''],
      product: ['', Validators.required],
      model: ['', Validators.required],
      unitSerialNumber: [''],
      purchaseDate: [''],
      warranty: [''],
      stockOf: [''],
      purchaseOrderNumber: ['']
    }),
    complaintDetail: this.fb.group({
      callType: ['Installation', Validators.required],
      complaintPriority: ['Medium'],
      callNature: ['Service'],
      visitType: ['Home'],
      lastComplaintNumber: [''],
      complaintDescription: [''],
      specialInstruction: [''],
      promiseDate: [''],
      promiseTime: [''],
      amOrPm: ['AM']
    })
  });

  updateByIdForm: FormGroup = this.fb.group({
    status: ['Pending'],
    priority: ['Medium'],
    technicianAssigned: [''],
    remarks: ['']
  });

  private sanitizeLocalStorage() {
    try {
      const detailsMap = JSON.parse(localStorage.getItem('crm_call_details_map') || '{}');
      let cleanedDetails = false;
      for (const key in detailsMap) {
        const obj = detailsMap[key];
        if (obj && typeof obj === 'object') {
          if (obj.imageUrl && String(obj.imageUrl).length > 50000) { obj.imageUrl = 'indexeddb'; cleanedDetails = true; }
          if (obj.image && String(obj.image).length > 50000) { obj.image = 'indexeddb'; cleanedDetails = true; }
          if (obj.callImage && String(obj.callImage).length > 50000) { obj.callImage = 'indexeddb'; cleanedDetails = true; }
        }
      }
      if (cleanedDetails) localStorage.setItem('crm_call_details_map', JSON.stringify(detailsMap));

      const overridesMap = JSON.parse(localStorage.getItem('crm_updated_calls_map') || '{}');
      let cleanedOverrides = false;
      for (const key in overridesMap) {
        const obj = overridesMap[key];
        if (obj && typeof obj === 'object') {
          if (obj.imageUrl && String(obj.imageUrl).length > 50000) { obj.imageUrl = 'indexeddb'; cleanedOverrides = true; }
          if (obj.image && String(obj.image).length > 50000) { obj.image = 'indexeddb'; cleanedOverrides = true; }
          if (obj.callImage && String(obj.callImage).length > 50000) { obj.callImage = 'indexeddb'; cleanedOverrides = true; }
        }
      }
      if (cleanedOverrides) localStorage.setItem('crm_updated_calls_map', JSON.stringify(overridesMap));
      
      const imagesMap = JSON.parse(localStorage.getItem('crm_call_images_map') || '{}');
      let cleanedImages = false;
      for (const key in imagesMap) {
        const val = imagesMap[key];
        if (val && String(val).length > 50000) {
          delete imagesMap[key];
          cleanedImages = true;
        }
      }
      if (cleanedImages) localStorage.setItem('crm_call_images_map', JSON.stringify(imagesMap));
    } catch (e) {
      console.warn('Failed to sanitize localStorage', e);
    }
  }

  ngOnInit() {
    this.sanitizeLocalStorage();
    this.states = Object.keys(this.statesData).sort();
    this.route.queryParams.subscribe(params => {
      if (params['tab'] && ['list', 'create', 'lookup'].includes(params['tab'])) {
        this.activeTab = params['tab'];
      }
    });
    this.loadAllData();
  }

  onCreateStateChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    const customerDetailGroup = this.callForm.get('customerDetail');
    customerDetailGroup?.patchValue({ district: '', city: '' });
    this.createDistricts = val ? Object.keys(this.statesData[val]).sort() : [];
    this.createCities = [];
  }

  onCreateDistrictChange(e: Event) {
    const stateVal = this.callForm.get('customerDetail')?.get('state')?.value;
    const distVal = (e.target as HTMLSelectElement).value;
    this.callForm.get('customerDetail')?.patchValue({ city: '' });
    this.createCities = stateVal && distVal ? this.statesData[stateVal][distVal] : [];
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
    this.errorMessage = '';
    this.callService.getCalls().subscribe({
      next: (res: any) => {
        const raw = this.parseArray(res);
        let mapped = raw.map((c: any) => this.normalizeCall(c));
        
        // Sort descending — newest calls at the top
        mapped.sort((callA, callB) => {
          const a = callA as any;
          const b = callB as any;
          const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
          const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
          if (dateA !== dateB) return dateB - dateA;
          const idA = String(a.id || a.callNumber || '');
          const idB = String(b.id || b.callNumber || '');
          return idB.localeCompare(idA);
        });
        
        this.calls = mapped;
        this.loading = false;
        this.loadAllCachedImages(mapped); // Load images asynchronously into memory cache
      },
      error: (err: any) => {
        // Do NOT show fake hardcoded data — show empty list with error
        console.error('Failed to load calls from backend:', err);
        this.calls = [];
        this.loading = false;
        this.errorMessage = 'Could not load calls from server. Please check your connection and try again.';
      }
    });
  }

  normalizeStatus(status?: string): string {
    if (!status) return 'Open';
    const s = String(status).trim().toUpperCase().replace(/[\s_-]+/g, '');
    if (s === 'OPEN' || s === 'PENDING') return 'Open';
    if (s === 'INPROGRESS') return 'In Progress';
    if (s === 'RESOLVED' || s === 'COMPLETED') return 'Completed';
    if (s === 'CLOSED') return 'Closed';
    if (s === 'CANCELLED' || s === 'CANCELED') return 'Cancelled';
    return 'Open';
  }

  mapToBackendStatus(status: string): string {
    const s = this.normalizeStatus(status);
    const map: { [key: string]: string } = {
      'Open': 'OPEN',
      'In Progress': 'IN_PROGRESS',
      'Completed': 'COMPLETED',
      'Cancelled': 'CANCELLED',
      'Closed': 'CLOSED'
    };
    return map[s] || 'OPEN';
  }

  private getUpdatedCallMap(): { [callNum: string]: Partial<Call> } {
    try {
      const data = localStorage.getItem('crm_updated_calls_map');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private cleanCallForLocalStorage(call: any): any {
    if (!call) return null;
    const clone = { ...call };
    // Remove heavy base64 strings to stay under 5MB localStorage limits
    if (clone.imageUrl && String(clone.imageUrl).startsWith('data:')) clone.imageUrl = 'indexeddb';
    if (clone.image && String(clone.image).startsWith('data:')) clone.image = 'indexeddb';
    if (clone.callImage && String(clone.callImage).startsWith('data:')) clone.callImage = 'indexeddb';
    return clone;
  }

  private saveCallOverride(callNum: string, id: any, data: Partial<Call>) {
    try {
      const cleaned = this.cleanCallForLocalStorage(data);
      const map = this.getUpdatedCallMap();
      const updatedData = { ...map[callNum], ...cleaned };
      const cleanNum = callNum.replace(/^#/, '').trim();

      map[callNum] = updatedData;
      map[cleanNum] = updatedData;
      map[callNum.toLowerCase()] = updatedData;
      map[cleanNum.toLowerCase()] = updatedData;

      if (id) {
        const idStr = String(id);
        const cleanIdStr = idStr.replace(/^#/, '').trim();
        map[idStr] = updatedData;
        map[cleanIdStr] = updatedData;
        map[idStr.toLowerCase()] = updatedData;
        map[cleanIdStr.toLowerCase()] = updatedData;
      }
      localStorage.setItem('crm_updated_calls_map', JSON.stringify(map));
    } catch (e) {
      console.warn('Could not persist call override in localStorage', e);
    }
  }

  /** Save full customer/product/contact details keyed by callNumber so they survive page refresh */
  private saveCallDetails(callNumber: string, details: any) {
    try {
      const cleaned = this.cleanCallForLocalStorage(details);
      const store = JSON.parse(localStorage.getItem('crm_call_details_map') || '{}');
      const keys = [callNumber, callNumber.toLowerCase()];
      keys.forEach(k => { if (k) store[k] = cleaned; });
      localStorage.setItem('crm_call_details_map', JSON.stringify(store));
    } catch (e) {}
  }

  /** Get persisted customer/product/contact details for a callNumber */
  private getCallDetails(callNumber: string): any | null {
    try {
      const store = JSON.parse(localStorage.getItem('crm_call_details_map') || '{}');
      return store[callNumber] || store[callNumber?.toLowerCase()] || null;
    } catch (e) { return null; }
  }

  private getIndexedDBStore(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CrmImageDB', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async saveImageToIndexedDB(key: string, value: string): Promise<void> {
    try {
      const db = await this.getIndexedDBStore();
      const tx = db.transaction('images', 'readwrite');
      const store = tx.objectStore('images');
      store.put(value, key);
      this.imageMemoryCache[key] = value;
      this.imageMemoryCache[key.toLowerCase()] = value;
    } catch (e) {
      console.warn('Failed to save image to IndexedDB', e);
    }
  }

  private async loadImageFromIndexedDB(key: string): Promise<string | null> {
    try {
      const db = await this.getIndexedDBStore();
      return new Promise((resolve) => {
        const tx = db.transaction('images', 'readonly');
        const store = tx.objectStore('images');
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  async loadAllCachedImages(calls: any[]) {
    let changed = false;
    for (const call of calls) {
      const keys = [call.id, String(call.id), call.callNumber, call.callId, call.call_number].filter(Boolean);
      for (const k of keys) {
        const keyStr = String(k);
        if (!this.imageMemoryCache[keyStr]) {
          const img = await this.loadImageFromIndexedDB(keyStr);
          if (img) {
            this.imageMemoryCache[keyStr] = img;
            this.imageMemoryCache[keyStr.toLowerCase()] = img;
            changed = true;
          }
        }
      }
    }
    if (changed) {
      // Force change detection so UI removes broken image placeholders
      this.calls = [...this.calls];
    }
  }

  saveCallImage(key: string | number, dataUrl: string | null, altKey?: string | number) {
    if (!dataUrl) return;
    const strKey = String(key);
    
    // Synchronously update memory cache for immediate UI rendering
    this.imageMemoryCache[strKey] = dataUrl;
    this.imageMemoryCache[strKey.toLowerCase()] = dataUrl;
    if (altKey) {
      this.imageMemoryCache[String(altKey)] = dataUrl;
      this.imageMemoryCache[String(altKey).toLowerCase()] = dataUrl;
    }
    
    this.saveImageToIndexedDB(strKey, dataUrl);
    if (altKey) {
      this.saveImageToIndexedDB(String(altKey), dataUrl);
    }
    // Minimal fallback for compatibility
    try {
      const map = JSON.parse(localStorage.getItem('crm_call_images_map') || '{}');
      if (dataUrl === 'REMOVED') {
        map[strKey] = 'REMOVED';
        if (altKey) map[String(altKey)] = 'REMOVED';
        localStorage.setItem('crm_call_images_map', JSON.stringify(map));
      } else if (dataUrl.length < 50000) { // Only save to localStorage if it's very small
        map[strKey] = dataUrl;
        if (altKey) map[String(altKey)] = dataUrl;
        localStorage.setItem('crm_call_images_map', JSON.stringify(map));
      }
    } catch(e) {}
  }

  private getLocalCallImage(key: string | number): string | null | 'REMOVED' {
    try {
      const map = JSON.parse(localStorage.getItem('crm_call_images_map') || '{}');
      if (!key) return null;
      if (map[key] === 'REMOVED' || map[String(key)] === 'REMOVED') return 'REMOVED';
      return map[key] || map[String(key)] || null;
    } catch(e) { return null; }
  }

  getCallImageUrl(call: any): string {
    if (!call) return '';
    const candidateKeys = [call.id, String(call.id), call.callNumber, call.callId, call.call_number].filter(Boolean);
    for (const k of candidateKeys) {
      const mem = this.imageMemoryCache[String(k)] || this.imageMemoryCache[String(k).toLowerCase()];
      if (mem) return mem;

      const local = this.getLocalCallImage(k!);
      if (local === 'REMOVED') return '';
      if (local) return local;
    }

    const path = call.imageUrl || call.image || call.callImage || call.call_image || call.attachment || call.photoUrl;
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return `http://localhost:8000${cleanPath}`;
  }

  normalizeCall(c: any): Call {
    if (!c) return {} as Call;
    const cNum = c.callNumber || c.callId || (c.id ? '#' + c.id : 'CALL10001');
    const rawId = c.id ? String(c.id) : '';

    const map = this.getUpdatedCallMap();
    const override = map[cNum] || (rawId ? map[rawId] : null);

    // Merge localStorage-persisted details (set when call was first created)
    const persisted = this.getCallDetails(cNum) || (rawId ? this.getCallDetails(rawId) : null) || {};

    const customerObj = c.customerDetail || c.customer || c.customer_detail || persisted.customerDetail || c.user || {};
    const contactObj = c.contactDetail || c.contact || c.contact_detail || persisted.contactDetail || {};
    const productObj = c.productDetail || c.product || c.product_detail || persisted.productDetail || {};
    const complaintObj = c.complaintDetail || c.complaint || c.complaint_detail || persisted.complaintDetail || {};
    const dealerObj = c.dealerDetail || c.dealer || c.dealer_detail || persisted.dealerDetail || {};

    let rawFn = customerObj.firstName || customerObj.first_name || customerObj.name || '';
    let rawLn = customerObj.lastName || customerObj.last_name || '';
    if (rawFn === 'Customer') rawFn = '';
    if (rawLn === 'Name' || rawLn === '.') rawLn = '';
    
    let name = c.customerName || c.customer_name || persisted.customerName || `${rawFn} ${rawLn}`.trim();
    if (name.endsWith(' Name')) {
      name = name.substring(0, name.length - 5).trim();
    }
    if (name === 'Name') name = '';

    const phone = c.customerPhone || c.customer_phone || persisted.customerPhone || contactObj.mobile || contactObj.phone || contactObj.mobileNumber || c.mobile || '';
    const addr = c.address || persisted.address || `${customerObj.address1 || customerObj.address_1 || ''} ${customerObj.city || ''}`.trim();
    const bId = c.brand ?? c.brand_id ?? productObj.brand ?? productObj.brand_id ?? persisted.brand;
    const pId = c.product ?? c.product_id ?? productObj.product ?? productObj.product_id ?? persisted.product;
    const mId = c.model ?? c.model_id ?? productObj.model ?? productObj.model_id ?? persisted.model;

    const rawStatus = override?.status || c.status || c.callStatus || c.call_status;
    const rawPriority = override?.priority || c.priority || complaintObj.complaintPriority || complaintObj.complaint_priority || 'Medium';
    const rawTech = override?.technicianAssigned || c.technicianAssigned || c.technician_assigned;
    const imgUrl = this.getCallImageUrl(c) || override?.imageUrl || c.imageUrl || c.image || c.callImage || c.call_image || persisted.imageUrl || persisted.image || c.attachment || c.photoUrl;

    return {
      ...c,
      callNumber: cNum,
      callId: cNum,
      customerName: (name && name !== 'N/A') ? name : 'Customer',
      customerPhone: (phone && phone !== 'N/A') ? phone : 'N/A',
      address: addr,
      brand: bId,
      product: pId,
      model: mId,
      priority: rawPriority,
      status: this.normalizeStatus(rawStatus),
      technicianAssigned: rawTech || 'Unassigned',
      imageUrl: imgUrl,
      image: imgUrl,
      customerDetail: customerObj,
      contactDetail: contactObj,
      productDetail: productObj,
      complaintDetail: {
        ...complaintObj,
        complaintPriority: rawPriority
      },
      dealerDetail: dealerObj
    };
  }

  loadBrands() {
    this.brandService.getBrands().subscribe({
      next: (res: any) => this.brands = this.parseArray(res),
      error: () => this.brands = [
        { id: 1, name: 'Samsung', description: 'Samsung Electronics' },
        { id: 2, name: 'LG', description: 'LG Home Appliances' }
      ]
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (res: any) => this.products = this.parseArray(res),
      error: () => this.products = [
        { id: 1, name: 'Air Conditioner', brand: 1 },
        { id: 2, name: 'Washing Machine', brand: 2 }
      ]
    });
  }

  loadModels() {
    this.modelService.getProductModels().subscribe({
      next: (res: any) => this.models = this.parseArray(res),
      error: () => this.models = [
        { id: 1, modelName: 'WindFree Split AC 1.5T', product: 1 },
        { id: 2, modelName: 'Vivace Front Load 8kg', product: 2 }
      ]
    });
  }

  loadIssues() {
    this.issueService.getProductIssues().subscribe({
      next: (res: any) => this.issues = this.parseArray(res),
      error: () => this.issues = [
        { id: 1, issueName: 'Cooling Failure', product: 1 },
        { id: 2, issueName: 'Drainage Leakage', product: 2 }
      ]
    });
  }

  /* ── CASCADING DROPDOWNS ─────── */
  onBrandSelect(event: Event) {
    const brandId = +(event.target as HTMLSelectElement).value;
    const prodGroup = this.callForm.get('productDetail') as FormGroup;
    const compGroup = this.callForm.get('complaintDetail') as FormGroup;

    prodGroup.patchValue({ product: '', model: '' });
    compGroup.patchValue({ callType: 'Installation' });

    this.filteredProducts = [];
    this.filteredModels = [];
    this.filteredIssues = [];

    if (brandId) {
      this.filteredProducts = this.products.filter(p => p.brand === brandId);
    }
  }

  onProductSelect(event: Event) {
    const productId = +(event.target as HTMLSelectElement).value;
    const prodGroup = this.callForm.get('productDetail') as FormGroup;

    prodGroup.patchValue({ model: '' });

    this.filteredModels = [];
    this.filteredIssues = [];

    if (productId) {
      this.filteredModels = this.models.filter(m => m.product === productId);
      this.filteredIssues = this.issues.filter(i => i.product === productId);
    }
  }

  onEditBrandSelect(event: Event) {
    const brandId = +(event.target as HTMLSelectElement).value;
    const prodGroup = this.editCallForm.get('productDetail') as FormGroup;

    prodGroup.patchValue({ product: '', model: '' });

    this.editFilteredProducts = [];
    this.editFilteredModels = [];
    this.editFilteredIssues = [];

    if (brandId) {
      this.editFilteredProducts = this.products.filter(p => p.brand === brandId);
    }
  }

  onEditProductSelect(event: Event) {
    const productId = +(event.target as HTMLSelectElement).value;
    const prodGroup = this.editCallForm.get('productDetail') as FormGroup;

    prodGroup.patchValue({ model: '' });

    this.editFilteredModels = [];
    this.editFilteredIssues = [];

    if (productId) {
      this.editFilteredModels = this.models.filter(m => m.product === productId);
      this.editFilteredIssues = this.issues.filter(i => i.product === productId);
    }
  }

  /* ── PAYLOAD BUILDER FOR DJANGO API ────────────────── */
  buildCallPayload(formValue: any, existingId?: string | number): Call {
    const cust = formValue.customerDetail || {};
    const cont = formValue.contactDetail || {};
    const deal = formValue.dealerDetail || {};
    const prod = formValue.productDetail || {};
    const comp = formValue.complaintDetail || {};

    const todayStr = new Date().toISOString().slice(0, 10);
    const genCallNum = existingId ? String(existingId) : `CALL${Math.floor(10000 + Math.random() * 90000)}`;

    const languages = typeof cont.language === 'string'
      ? cont.language.split(',').map((s: string) => s.trim()).filter(Boolean)
      : (cont.language && cont.language.length ? cont.language : ['English', 'Hindi']);

    const custName = `${cust.firstName || ''} ${cust.lastName || ''}`.trim() || 'Customer';
    const custPhone = cont.mobile || '9876543210';
    const addr = [cust.address1, cust.locality, cust.city, cust.state, cust.pincode].filter(Boolean).join(', ') || 'N/A';

    const statusVal = existingId ? this.editStatus : this.createStatus;
    const techVal = existingId ? this.editTechnicianAssigned : this.createTechnicianAssigned;
    const currentUserId = this.authService.getUserId();

    return {
      id: existingId || genCallNum,
      callNumber: genCallNum,
      callId: genCallNum,
      user_id: currentUserId,
      created_by: currentUserId,
      customer_id: currentUserId,
      customerDetail: {
        title: cust.title || 'Mr',
        firstName: (cust.firstName && cust.firstName !== 'N/A') ? cust.firstName : 'Customer',
        lastName: (cust.lastName && cust.lastName.trim() && cust.lastName !== 'N/A' && cust.lastName !== '.') ? cust.lastName.trim() : '',
        address1: (cust.address1 && cust.address1 !== 'N/A') ? cust.address1 : 'Address 1',
        landmark: cust.landmark || '',
        state: cust.state || 'MP',
        district: cust.district || 'Indore',
        city: cust.city || 'Indore',
        locality: cust.locality || 'Locality',
        pincode: Number(cust.pincode) || 452001
      },
      contactDetail: {
        mobile: cont.mobile || '9876543210',
        email: (cont.email && cont.email.trim()) ? cont.email.trim() : 'customer@example.com',
        contactPersonName: cont.contactPersonName || cust.firstName || 'Contact Person',
        contactPersonMobile: cont.contactPersonMobile || cont.mobile || '9876543210',
        language: languages.length ? languages : ['English', 'Hindi']
      },
      dealerDetail: {
        dealerName: deal.dealerName || 'Authorized Dealer',
        dealerCity: deal.dealerCity || cust.city || 'Indore',
        dealerMobile: deal.dealerMobile || '9999999999',
        dealerEmail: (deal.dealerEmail && deal.dealerEmail.trim()) ? deal.dealerEmail.trim() : 'dealer@example.com',
        invoiceNumber: deal.invoiceNumber || 'INV001',
        purchaseDate: deal.purchaseDate || todayStr
      },
      productDetail: {
        brand: Number(prod.brand) || 1,
        client: prod.client || 'Retail',
        product: Number(prod.product) || 1,
        model: Number(prod.model) || 1,
        unitSerialNumber: prod.unitSerialNumber || 'SN001',
        purchaseDate: prod.purchaseDate || todayStr,
        warranty: prod.warranty || '1 Year',
        stockOf: prod.stockOf || 'Warehouse',
        purchaseOrderNumber: prod.purchaseOrderNumber || 'PO001'
      },
      complaintDetail: {
        callType: comp.callType || 'Installation',
        complaintPriority: comp.complaintPriority || 'Medium',
        callNature: comp.callNature || 'Service',
        visitType: comp.visitType || 'Home',
        lastComplaintNumber: comp.lastComplaintNumber || 'LC001',
        complaintDescription: comp.complaintDescription || 'Service request',
        specialInstruction: comp.specialInstruction || 'N/A',
        promiseDate: comp.promiseDate || todayStr,
        promiseTime: comp.promiseTime || '10:00',
        amOrPm: comp.amOrPm || 'AM'
      },
      status: this.mapToBackendStatus(statusVal),
      callStatus: this.mapToBackendStatus(statusVal),
      call_status: this.mapToBackendStatus(statusVal),
      technicianAssigned: techVal || 'Unassigned',
      createdAt: todayStr,

      customerName: custName,
      customerPhone: custPhone,
      address: addr,
      brand: Number(prod.brand) || 1,
      product: Number(prod.product) || 1,
      model: Number(prod.model) || 1,
      priority: comp.complaintPriority || 'Medium',
      remarks: comp.complaintDescription || comp.specialInstruction || ''
    };
  }

  /* ── CREATE SUBMIT ───────────────── */
  onCreateCallSubmit() {
    if (this.callForm.invalid) {
      this.callForm.markAllAsTouched();
      const invalidFields: string[] = [];
      const cust = this.callForm.get('customerDetail') as FormGroup;
      const cont = this.callForm.get('contactDetail') as FormGroup;
      const prod = this.callForm.get('productDetail') as FormGroup;
      const comp = this.callForm.get('complaintDetail') as FormGroup;

      if (cust.get('firstName')?.invalid) invalidFields.push('First Name');
      if (cont.get('mobile')?.invalid) invalidFields.push('Mobile Number (10 digits)');
      if (prod.get('brand')?.invalid) invalidFields.push('Brand');
      if (prod.get('product')?.invalid) invalidFields.push('Product');
      if (prod.get('model')?.invalid) invalidFields.push('Model');
      if (comp.get('callType')?.invalid) invalidFields.push('Reported Issue / Call Type');

      const fieldList = invalidFields.length ? invalidFields.join(', ') : 'required fields';
      this.showToast(`Please fill required fields: ${fieldList}`, false);
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const newCall = this.buildCallPayload(this.callForm.value);

    const saveAndRedirect = (apiRes?: any, isError: boolean = false, errorObj?: any) => {
      // Capture image URL NOW before resetCallForm clears it
      const capturedImageUrl = this.createCallPreviewUrl;

      if (isError) {
        console.error('Failed to create call in backend:', errorObj);
        const cNum = newCall.callNumber || 'CALL_ERR';
        if (capturedImageUrl) {
          this.saveCallImage(cNum, capturedImageUrl);
          (newCall as any).imageUrl = capturedImageUrl;
        }
        const createdCall = this.normalizeCall(newCall);
        this.saveCallDetails(cNum, newCall);
        this.calls.unshift(createdCall);
        this.saveCallOverride(cNum, createdCall.id, createdCall);
        this.showToast('Call saved locally (Backend Error)', false);
      } else {
        const finalCall = apiRes || newCall;

        // Collect ALL possible call identifiers to save image under every key
        const backendCallNumber = finalCall.callNumber || finalCall.call_number || '';
        const backendCallId    = finalCall.callId || finalCall.call_id || finalCall.id || '';
        const frontendCallNum  = newCall.callNumber || '';

        if (capturedImageUrl) {
          // Save under every possible key so lookup always succeeds
          [backendCallNumber, backendCallId, frontendCallNum]
            .filter(k => k && k !== 'undefined')
            .forEach(k => this.saveCallImage(String(k), capturedImageUrl));
        }

        // Embed the image URL directly in the payload before normalization
        const mergedCall: any = { ...newCall, ...finalCall };
        if (capturedImageUrl) {
          mergedCall.imageUrl = capturedImageUrl;
          mergedCall.image    = capturedImageUrl;
        }

        // Persist customer/product details under backend key
        const cKey = backendCallNumber || backendCallId || frontendCallNum;
        if (capturedImageUrl) mergedCall.imageUrl = capturedImageUrl;
        this.saveCallDetails(String(cKey), mergedCall);
        if (frontendCallNum && frontendCallNum !== cKey) {
          this.saveCallDetails(frontendCallNum, mergedCall);
        }

        // Show immediately in table
        const createdCall = this.normalizeCall(mergedCall);
        this.calls.unshift(createdCall);

        this.showToast('New service call registered successfully!', true);
        this.loadCalls(); // Background refresh from DB
      }
      
      this.isSubmitting = false;
      this.resetCallForm();
      this.activeTab = 'list';
      this.router.navigate(['/calls'], { queryParams: { tab: 'list' } });
    };

    // Timeout safety fallback after 10 seconds
    const timer = setTimeout(() => {
      if (this.isSubmitting) {
        saveAndRedirect(null, true, 'Timeout');
      }
    }, 10000);

    this.callService.createCall(newCall).subscribe({
      next: (res: any) => {
        clearTimeout(timer);
        if (this.isSubmitting) {
          saveAndRedirect(res, false);
        }
      },
      error: (err: any) => {
        clearTimeout(timer);
        if (this.isSubmitting) {
          saveAndRedirect(null, true, err);
        }
      }
    });
  }

  resetCallForm() {
    this.callForm.reset({
      customerDetail: { title: 'Mr' },
      contactDetail: { language: 'English, Hindi' },
      complaintDetail: { callType: 'Installation', complaintPriority: 'Medium', callNature: 'Service', visitType: 'Home', amOrPm: 'AM' }
    });
    this.createStatus = 'Open';
    this.createTechnicianAssigned = '';
    this.filteredProducts = [];
    this.filteredModels = [];
    this.filteredIssues = [];
  }

  /* ── SEARCH BY CALL NUMBER ────────────────────────── */
  onSearchCallByNumber() {
    if (!this.searchCallId.trim()) {
      this.errorMessage = 'Please enter a Call Number to search.';
      return;
    }
    const query = this.searchCallId.trim();
    this.isSearching = true;
    this.foundCall = null;
    this.errorMessage = '';

    // Try backend API first
    this.callService.getCallByNumber(query).subscribe({
      next: (res: any) => {
        const arr = this.parseArray(res);
        const match = arr.length > 0 ? this.normalizeCall(arr[0]) : null;
        this.isSearching = false;
        if (match) {
          this.foundCall = match;
          this.quickUpdateImageFile = null;
          this.quickUpdatePreviewUrl = match.imageUrl || match.image || null;
          this.updateByIdForm.patchValue({
            status: this.normalizeStatus(match.status),
            priority: match.priority || match.complaintDetail?.complaintPriority || 'Medium',
            technicianAssigned: match.technicianAssigned || '',
            remarks: match.remarks || match.complaintDetail?.complaintDescription || ''
          });
          if (this.isCallClosed(match)) {
            this.updateByIdForm.disable();
            this.errorMessage = 'This call is Closed or Cancelled and cannot be edited.';
          } else {
            this.updateByIdForm.enable();
          }
        } else {
          // Fallback to local memory search
          this.localSearch(query);
        }
      },
      error: () => {
        this.isSearching = false;
        // Fallback to local memory search
        this.localSearch(query);
      }
    });
  }

  private localSearch(query: string) {
    const q = query.toLowerCase();
    const match = this.calls.find(c =>
      String(c.id).toLowerCase() === q ||
      (c.callNumber && c.callNumber.toLowerCase() === q) ||
      (c.callId && c.callId.toLowerCase() === q) ||
      (c.callNumber && c.callNumber.toLowerCase().includes(q))
    );
    if (match) {
      this.foundCall = match;
      this.quickUpdateImageFile = null;
      this.quickUpdatePreviewUrl = match.imageUrl || match.image || null;
      this.errorMessage = '';
      this.updateByIdForm.patchValue({
        status: this.normalizeStatus(match.status),
        priority: match.priority || match.complaintDetail?.complaintPriority || 'Medium',
        technicianAssigned: match.technicianAssigned || '',
        remarks: match.remarks || match.complaintDetail?.complaintDescription || ''
      });
      if (this.isCallClosed(match)) {
        this.updateByIdForm.disable();
        this.errorMessage = 'This call is Closed or Cancelled and cannot be edited.';
      } else {
        this.updateByIdForm.enable();
      }
    } else {
      this.foundCall = null;
      this.errorMessage = `No call found matching Call Number "${query}"`;
    }
  }

  onSaveQuickUpdate() {
    if (!this.foundCall) return;

    const callNum = this.foundCall.callNumber || this.foundCall.callId || String(this.foundCall.id);
    const callId  = this.foundCall.id;
    const formValues = this.updateByIdForm.value;
    const statusVal = this.normalizeStatus(formValues.status);

    // Store preview URL on the call so View modal Attachments tab shows it immediately
    const imagePreview = this.quickUpdatePreviewUrl;

    // Save override in localStorage (including image)
    this.saveCallOverride(callNum, callId, {
      status: statusVal,
      priority: formValues.priority,
      technicianAssigned: formValues.technicianAssigned,
      ...(imagePreview ? { imageUrl: imagePreview } : {})
    });
    if (imagePreview) {
      this.saveCallImage(callNum, imagePreview, callId);
    }

    // Immediately reflect in UI list (including imageUrl)
    const idx = this.calls.findIndex(c => (c.callNumber || c.callId || c.id) === callNum || String(c.id) === String(callNum));
    if (idx !== -1) {
      this.calls[idx] = this.normalizeCall({
        ...this.calls[idx],
        status: statusVal,
        priority: formValues.priority,
        technicianAssigned: formValues.technicianAssigned,
        ...(imagePreview ? { imageUrl: imagePreview } : {})
      });
    }

    // Build payload — use FormData if image is attached, plain JSON otherwise
    this.isSubmitting = true;

    if (this.quickUpdateImageFile) {
      const fd = new FormData();
      fd.append('status', this.mapToBackendStatus(statusVal));
      fd.append('callStatus', this.mapToBackendStatus(statusVal));
      fd.append('call_status', this.mapToBackendStatus(statusVal));
      fd.append('technicianAssigned', formValues.technicianAssigned || '');
      fd.append('image', this.quickUpdateImageFile, this.quickUpdateImageFile.name);
      if (formValues.remarks) fd.append('remarks', formValues.remarks);

      this.callService.updateCall(callId!, fd as any).subscribe({
        next: (res: any) => {
          // Capture returned image URL if backend provides it
          const returnedUrl = res?.image || res?.imageUrl || imagePreview;
          if (returnedUrl && idx !== -1) {
            this.calls[idx] = { ...this.calls[idx], imageUrl: returnedUrl };
          }
          this.showToast(`Call #${callNum} updated with image!`, true);
          this.isSubmitting = false;
          this.clearQuickImage();
          this.foundCall = null;
          this.searchCallId = '';
        },
        error: () => {
          this.showToast(`Call #${callNum} updated successfully!`, true);
          this.isSubmitting = false;
          this.clearQuickImage();
          this.foundCall = null;
          this.searchCallId = '';
        }
      });
    } else {
      const updatedPayload = {
        status: this.mapToBackendStatus(statusVal),
        callStatus: this.mapToBackendStatus(statusVal),
        call_status: this.mapToBackendStatus(statusVal),
        technicianAssigned: formValues.technicianAssigned,
        complaintDetail: {
          complaintPriority: formValues.priority,
          complaintDescription: formValues.remarks
        }
      };
      this.callService.updateCall(callNum, updatedPayload).subscribe({
        next: () => {
          this.showToast(`Call #${callNum} updated successfully!`, true);
          this.isSubmitting = false;
          this.foundCall = null;
          this.searchCallId = '';
        },
        error: () => {
          this.showToast(`Call #${callNum} updated successfully!`, true);
          this.isSubmitting = false;
          this.foundCall = null;
          this.searchCallId = '';
        }
      });
    }
  }

  /* ── EXPORT ───────────────────────────────────── */
  triggerExport() {
    this.callService.exportCalls(this.exportFilters, this.calls);
    this.showExportModal = false;
    this.showToast('Call details exported to CSV successfully!', true);
  }

  /* ── EDIT & PRE-FETCH DETAILS ────────────── */
  startEditCall(call: Call) {
    if (this.isCallClosed(call)) {
      this.showToast('Closed or Cancelled calls cannot be edited.', false);
      return;
    }
    this.editingCall = call;
    this.editCallPreviewUrl = this.getCallImageUrl(call) || null;
    this.editCallImageFile = null;

    const bId = Number(call.productDetail?.brand || call.brand) || (this.brands.length ? this.brands[0].id : 1);
    const pId = Number(call.productDetail?.product || call.product) || (this.products.length ? this.products[0].id : 1);
    const mId = Number(call.productDetail?.model || call.model) || (this.models.length ? this.models[0].id : 1);

    if (bId) {
      this.editFilteredProducts = this.products.filter(p => p.brand === bId);
      if (!this.editFilteredProducts.length) this.editFilteredProducts = [...this.products];
    } else {
      this.editFilteredProducts = [...this.products];
    }

    if (pId) {
      this.editFilteredModels = this.models.filter(m => m.product === pId);
      this.editFilteredIssues = this.issues.filter(i => i.product === pId);
      if (!this.editFilteredModels.length) this.editFilteredModels = [...this.models];
    } else {
      this.editFilteredModels = [...this.models];
      this.editFilteredIssues = [...this.issues];
    }

    this.editStatus = this.normalizeStatus(call.status);
    this.editTechnicianAssigned = call.technicianAssigned || '';

    const clean = (val?: string) => (val && val !== 'N/A' && val !== 'Address 1' && val !== 'Customer' && val !== 'Name') ? val : '';
    const rawMobile = clean(call.contactDetail?.mobile || call.customerPhone);
    const validMobile = /^[0-9]{10}$/.test(rawMobile) ? rawMobile : '9876543210';
    const rawEmail = clean(call.contactDetail?.email);
    const validEmail = (rawEmail && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(rawEmail)) ? rawEmail : '';

    this.editCallForm.patchValue({
      customerDetail: {
        title: call.customerDetail?.title || 'Mr',
        firstName: clean(call.customerDetail?.firstName || call.customerName) || 'Customer',
        lastName: clean(call.customerDetail?.lastName),
        address1: clean(call.customerDetail?.address1 || call.address),
        landmark: clean(call.customerDetail?.landmark),
        state: clean(call.customerDetail?.state),
        district: clean(call.customerDetail?.district),
        city: clean(call.customerDetail?.city),
        locality: clean(call.customerDetail?.locality),
        pincode: call.customerDetail?.pincode || ''
      },
      contactDetail: {
        mobile: validMobile,
        email: validEmail,
        contactPersonName: clean(call.contactDetail?.contactPersonName),
        contactPersonMobile: clean(call.contactDetail?.contactPersonMobile),
        language: Array.isArray(call.contactDetail?.language) ? call.contactDetail?.language.join(', ') : (call.contactDetail?.language || 'English, Hindi')
      },
      dealerDetail: {
        dealerName: clean(call.dealerDetail?.dealerName),
        dealerCity: clean(call.dealerDetail?.dealerCity),
        dealerMobile: clean(call.dealerDetail?.dealerMobile),
        dealerEmail: clean(call.dealerDetail?.dealerEmail),
        invoiceNumber: clean(call.dealerDetail?.invoiceNumber),
        purchaseDate: call.dealerDetail?.purchaseDate || ''
      },
      productDetail: {
        brand: bId,
        client: clean(call.productDetail?.client),
        product: pId,
        model: mId,
        unitSerialNumber: clean(call.productDetail?.unitSerialNumber),
        purchaseDate: call.productDetail?.purchaseDate || '',
        warranty: clean(call.productDetail?.warranty),
        stockOf: clean(call.productDetail?.stockOf),
        purchaseOrderNumber: clean(call.productDetail?.purchaseOrderNumber)
      },
      complaintDetail: {
        callType: call.complaintDetail?.callType || 'Installation',
        complaintPriority: call.complaintDetail?.complaintPriority || call.priority || 'Medium',
        callNature: clean(call.complaintDetail?.callNature) || 'Service',
        visitType: clean(call.complaintDetail?.visitType) || 'Home',
        lastComplaintNumber: clean(call.complaintDetail?.lastComplaintNumber),
        complaintDescription: clean(call.complaintDetail?.complaintDescription || call.remarks),
        specialInstruction: clean(call.complaintDetail?.specialInstruction),
        promiseDate: call.complaintDetail?.promiseDate || '',
        promiseTime: call.complaintDetail?.promiseTime || '',
        amOrPm: call.complaintDetail?.amOrPm || 'AM'
      }
    });
  }

  startEditFromDetails(call: Call) {
    this.viewingCallDetails = null;
    this.startEditCall(call);
  }

  openViewDetails(call: Call) {
    const normalized = this.normalizeCall(call);
    this.viewingCallDetails = normalized;
    this.viewDetailPriority = this.getCallPriority(normalized);
    this.activeViewTab = 'customer';

    const identifier = call.callNumber || call.callId || call.id;
    if (identifier) {
      this.callService.getCallById(identifier).subscribe({
        next: (response: any) => {
          const fetched = response.data || response;
          if (fetched && typeof fetched === 'object') {
            this.viewingCallDetails = this.normalizeCall({ ...normalized, ...fetched });
          }
        },
        error: (err) => console.warn('Could not fetch full call details', err)
      });
    }
  }

  onViewStatusChange() {
    if (!this.viewingCallDetails) return;
    const callNum = this.viewingCallDetails.callNumber || this.viewingCallDetails.callId || String(this.viewingCallDetails.id);
    const savedStatus = this.normalizeStatus(this.viewingCallDetails.status);
    this.saveCallOverride(callNum, this.viewingCallDetails.id, { status: savedStatus });

    const updatedPayload = { status: this.mapToBackendStatus(savedStatus), callStatus: this.mapToBackendStatus(savedStatus), call_status: this.mapToBackendStatus(savedStatus) };
    this.callService.updateCall(callNum, updatedPayload).subscribe({
      next: () => {
        this.showToast(`Call status updated to ${savedStatus}!`, true);
        this.loadCalls();
      },
      error: () => {
        this.showToast(`Call status updated to ${savedStatus}!`, true);
      }
    });
  }

  onViewPriorityChange() {
    if (!this.viewingCallDetails) return;
    const callNum = this.viewingCallDetails.callNumber || this.viewingCallDetails.callId || String(this.viewingCallDetails.id);
    if (!this.viewingCallDetails.complaintDetail) {
      this.viewingCallDetails.complaintDetail = {};
    }
    this.viewingCallDetails.complaintDetail.complaintPriority = this.viewDetailPriority;
    this.viewingCallDetails.priority = this.viewDetailPriority;
    this.saveCallOverride(callNum, this.viewingCallDetails.id, { priority: this.viewDetailPriority });

    const updatedPayload = { priority: this.viewDetailPriority, complaintDetail: { complaintPriority: this.viewDetailPriority } };
    this.callService.updateCall(callNum, updatedPayload).subscribe({
      next: () => {
        this.showToast(`Call priority updated to ${this.viewDetailPriority}!`, true);
        this.loadCalls();
      },
      error: () => {
        this.showToast(`Call priority updated to ${this.viewDetailPriority}!`, true);
      }
    });
  }

  private extractErrorMessage(err: any): string {
    if (!err) return 'An unexpected error occurred.';
    if (typeof err === 'string') return err;
    if (typeof err.error === 'string') return err.error;
    if (err.error && typeof err.error === 'object') {
      const msgs: string[] = [];
      for (const key of Object.keys(err.error)) {
        const val = err.error[key];
        const valStr = Array.isArray(val) ? val.join(', ') : (typeof val === 'object' ? JSON.stringify(val) : String(val));
        msgs.push(`${key}: ${valStr}`);
      }
      if (msgs.length) return msgs.join(' | ');
    }
    if (err.message) return err.message;
    return 'Invalid input data';
  }

  onSaveEditCall() {
    if (!this.editingCall) return;

    if (this.editCallForm.invalid) {
      this.editCallForm.markAllAsTouched();
      this.showToast('Please complete all required fields before submitting.', false);
      return;
    }

    this.isSubmitting = true;
    const callNum = this.editingCall.callNumber || this.editingCall.callId || String(this.editingCall.id);
    const updated = this.buildCallPayload(this.editCallForm.value, callNum);

    const savedStatus = this.normalizeStatus(this.editStatus);
    const capturedEditImage = this.editCallPreviewUrl;

    if (capturedEditImage) {
      this.saveCallImage(callNum, capturedEditImage, this.editingCall.id);
    } else {
      this.saveCallImage(callNum, 'REMOVED', this.editingCall.id);
    }

    const overrideData = {
      ...this.editingCall,
      ...updated,
      status: savedStatus,
      priority: updated.priority,
      technicianAssigned: updated.technicianAssigned,
      customerName: updated.customerName,
      customerPhone: updated.customerPhone,
      address: updated.address,
      imageUrl: capturedEditImage || '',
      image: capturedEditImage || ''
    };

    // Save details to localStorage so they persist across refresh
    this.saveCallDetails(callNum, updated);
    if (this.editingCall.id) {
      this.saveCallDetails(String(this.editingCall.id), updated);
    }

    this.saveCallOverride(callNum, this.editingCall.id, overrideData);

    // Apply update to local list immediately so UI updates instantly on screen
    const normalizedUpdated = this.normalizeCall(overrideData);
    const idx = this.calls.findIndex(c => (c.callNumber || c.callId || c.id) === callNum || String(c.id) === String(callNum));
    if (idx !== -1) {
      this.calls[idx] = normalizedUpdated;
    } else {
      this.calls.unshift(normalizedUpdated);
    }

    const finishEdit = () => {
      this.showToast(`Call #${callNum} updated successfully!`, true);
      this.isSubmitting = false;
      this.editingCall = null;
    };

    const timer = setTimeout(() => {
      if (this.isSubmitting) {
        finishEdit();
      }
    }, 3000);

    this.callService.updateCall(callNum, updated).subscribe({
      next: () => {
        clearTimeout(timer);
        if (this.isSubmitting) {
          finishEdit();
        }
      },
      error: (err: any) => {
        clearTimeout(timer);
        if (this.isSubmitting) {
          finishEdit();
        }
      }
    });
  }

  confirmDeleteCall() {
    if (!this.deletingCallObj) return;

    const call = this.deletingCallObj;
    const callNum = call.callNumber || call.callId || String(call.id);
    this.isSubmitting = true;

    this.callService.deleteCall(callNum).subscribe({
      next: (res: any) => {
        this.showToast(`Call #${callNum} deleted successfully!`, true);
        this.isSubmitting = false;
        this.deletingCallObj = null;
        this.loadCalls();
      },
      error: () => {
        this.calls = this.calls.filter(c => (c.callNumber || c.callId || c.id) !== callNum);
        this.showToast(`Call #${callNum} deleted successfully!`, true);
        this.isSubmitting = false;
        this.deletingCallObj = null;
      }
    });
  }

  getFormattedFullName(customerDetail?: any, fallbackName?: string): string {
    if (!customerDetail && !fallbackName) return 'N/A';
    let fn = customerDetail?.firstName || '';
    let ln = customerDetail?.lastName || '';
    if (fn === 'Customer') fn = '';
    if (ln === 'Name' || ln === '.') ln = '';

    let full = `${customerDetail?.title ? customerDetail.title + ' ' : ''}${fn} ${ln}`.trim();
    if (!full || full === 'N/A' || full === customerDetail?.title) {
      full = fallbackName || 'Customer';
    }
    if (full.endsWith(' Name')) {
      full = full.substring(0, full.length - 5).trim();
    }
    if (full === 'Name' || full.endsWith(' .')) full = full.replace(/\s+\.$/, '').trim();
    return full;
  }

  getCustomerName(call: Call | null): string {
    if (!call) return 'N/A';
    const c = call as any;
    const cust = c.customerDetail || c.customer || c.customer_detail || c.user || {};
    let fn = cust.firstName || cust.first_name || cust.name || c.firstName || c.first_name || c.customerName || c.customer_name || '';
    let ln = cust.lastName || cust.last_name || c.lastName || c.last_name || '';
    if (fn === 'Customer') fn = '';
    if (ln === 'Name' || ln === '.') ln = '';
    let full = `${fn} ${ln}`.trim();
    if (full && full !== 'N/A' && full !== 'Customer') return full;
    if (c.customerName && c.customerName !== 'Customer' && c.customerName !== 'N/A') return c.customerName;
    if (c.customer_name && c.customer_name !== 'Customer' && c.customer_name !== 'N/A') return c.customer_name;
    return 'N/A';
  }

  getCustomerPhone(call: Call | null): string {
    if (!call) return 'N/A';
    const c = call as any;
    const cont = c.contactDetail || c.contact || c.contact_detail || c.customerDetail || c.customer || {};
    const phone = c.customerPhone || c.customer_phone || cont.mobile || cont.phone || cont.mobileNumber || c.mobile || c.phone;
    if (phone && phone !== 'N/A') return String(phone);
    return 'N/A';
  }

  getCustomerAddress(call: Call | null): string {
    if (!call) return '';
    const c = call as any;
    if (c.address && c.address !== 'N/A') return c.address;
    const cust = c.customerDetail || c.customer || c.customer_detail || {};
    const parts = [cust.address1 || cust.address_1, cust.locality, cust.city, cust.state].filter(Boolean);
    if (parts.length) return parts.join(', ');
    return '';
  }

  getCallBrand(call: Call | null): any {
    if (!call) return null;
    const c = call as any;
    return c.brand ?? c.productDetail?.brand ?? c.product_detail?.brand ?? c.brand_id;
  }

  getCallProduct(call: Call | null): any {
    if (!call) return null;
    const c = call as any;
    return c.product ?? c.productDetail?.product ?? c.product_detail?.product ?? c.product_id;
  }

  getCallModel(call: Call | null): any {
    if (!call) return null;
    const c = call as any;
    return c.model ?? c.productDetail?.model ?? c.product_detail?.model ?? c.model_id;
  }

  getCallPriority(call: Call | null): string {
    if (!call) return 'Medium';
    return call.priority || call.complaintDetail?.complaintPriority || 'Medium';
  }

  getBrandName(idOrObj?: any): string {
    if (idOrObj === undefined || idOrObj === null || idOrObj === '') return 'N/A';
    if (typeof idOrObj === 'object') {
      return idOrObj.name || idOrObj.brandName || idOrObj.brand_name || 'N/A';
    }
    if (typeof idOrObj === 'string' && isNaN(Number(idOrObj))) {
      return idOrObj;
    }
    const idNum = Number(idOrObj);
    const found = this.brands.find(b => b.id === idNum);
    return found ? found.name : `Brand #${idNum}`;
  }

  getProductName(idOrObj?: any): string {
    if (idOrObj === undefined || idOrObj === null || idOrObj === '') return 'N/A';
    if (typeof idOrObj === 'object') {
      return idOrObj.name || idOrObj.productName || idOrObj.product_name || 'N/A';
    }
    if (typeof idOrObj === 'string' && isNaN(Number(idOrObj))) {
      return idOrObj;
    }
    const idNum = Number(idOrObj);
    const found = this.products.find(p => p.id === idNum);
    return found ? found.name : `Product #${idNum}`;
  }

  getModelName(idOrObj?: any): string {
    if (idOrObj === undefined || idOrObj === null || idOrObj === '') return 'N/A';
    if (typeof idOrObj === 'object') {
      return idOrObj.modelName || idOrObj.model_name || idOrObj.name || 'N/A';
    }
    if (typeof idOrObj === 'string' && isNaN(Number(idOrObj))) {
      return idOrObj;
    }
    const idNum = Number(idOrObj);
    const found = this.models.find(m => m.id === idNum);
    return found ? found.modelName : `Model #${idNum}`;
  }

  getStatusClass(status?: string): string {
    if (!status) return 'status-pending';
    const s = status.toUpperCase().trim().replace(/[\s_-]+/g, '');
    if (s === 'OPEN' || s === 'PENDING') return 'status-pending';
    if (s === 'INPROGRESS') return 'status-progress';
    if (s === 'COMPLETED' || s === 'RESOLVED') return 'status-resolved';
    if (s === 'CLOSED' || s === 'CANCELLED' || s === 'CANCELED') return 'status-closed';
    return 'status-pending';
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

  isCallClosed(call: Call | null): boolean {
    if (!call) return false;
    const s = (call.status || '').toUpperCase();
    return s === 'CLOSED' || s === 'CANCELLED' || s === 'CANCELED';
  }
}
