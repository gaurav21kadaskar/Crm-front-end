import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CallService } from '../../core/services/call.service';
import { BrandService } from '../../core/services/brand.service';
import { ProductService } from '../../core/services/product.service';
import { ProductModelService } from '../../core/services/product-model.service';
import { ProductIssueService } from '../../core/services/product-issue.service';
import { ProductPartService } from '../../core/services/product-part.service';
import { AuthService } from '../../core/services/auth.service';
import { Call, CallExportFilter } from '../../core/models/call.model';
import { Brand } from '../../core/models/brand.model';
import { Product } from '../../core/models/product.model';
import { ProductModel } from '../../core/models/product-model.model';
import { ProductIssue } from '../../core/models/product-issue.model';
import { ProductPart } from '../../core/models/product-part.model';

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
                    @if (call.callNumber || call.callId || call.id || call.customerName) {
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
                          @if (isCustomer && isPendingApproval(call)) {
                            <button class="btn-row-approve" (click)="approveCallClosure(call)" title="Approve Call Closure">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                              Approve
                            </button>
                          }
                          @if (!isCustomer) {
                            <button class="btn-row-edit" [disabled]="isCallClosed(call)" (click)="startEditCall(call)" title="Update Call">
                              {{ isDistributor ? 'Update' : 'Edit' }}
                            </button>
                          }
                          @if (isAdmin) {
                            <button class="btn-row-delete" (click)="deletingCallObj = call" title="Delete Call">Delete</button>
                          }
                        </div>
                      </td>
                    </tr>
                    }
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
                    <label class="pro-label">Address 1 *</label>
                    <input type="text" class="pro-input" [class.is-invalid]="isFieldInvalid('customerDetail', 'address1')" formControlName="address1" placeholder="House / Flat / Street" />
                    @if (isFieldInvalid('customerDetail', 'address1')) { <span class="error-message">Address is required.</span> }
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Landmark</label>
                    <input type="text" class="pro-input" formControlName="landmark" placeholder="Near Park / Station" />
                  </div>
                </div>

                <div class="form-grid-2">
                  <div class="pro-form-group">
                    <label class="pro-label">Locality *</label>
                    <input type="text" class="pro-input" [class.is-invalid]="isFieldInvalid('customerDetail', 'locality')" formControlName="locality" placeholder="Locality" />
                    @if (isFieldInvalid('customerDetail', 'locality')) { <span class="error-message">Locality is required.</span> }
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">State *</label>
                    <select class="pro-input" [class.is-invalid]="isFieldInvalid('customerDetail', 'state')" formControlName="state" (change)="onCreateStateChange($event)">
                      <option value="">-- Select State --</option>
                      @for (s of states; track s) { <option [value]="s">{{ s }}</option> }
                    </select>
                    @if (isFieldInvalid('customerDetail', 'state')) { <span class="error-message">State is required.</span> }
                  </div>
                </div>

                <div class="form-grid-3">
                  <div class="pro-form-group">
                    <label class="pro-label">District *</label>
                    <select class="pro-input" [class.is-invalid]="isFieldInvalid('customerDetail', 'district')" formControlName="district" (change)="onCreateDistrictChange($event)" [attr.disabled]="!createDistricts.length ? true : null">
                      <option value="">-- Select District --</option>
                      @for (d of createDistricts; track d) { <option [value]="d">{{ d }}</option> }
                    </select>
                    @if (isFieldInvalid('customerDetail', 'district')) { <span class="error-message">District is required.</span> }
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">City *</label>
                    <select class="pro-input" [class.is-invalid]="isFieldInvalid('customerDetail', 'city')" formControlName="city" [attr.disabled]="!createCities.length ? true : null">
                      <option value="">-- Select City --</option>
                      @for (c of createCities; track c) { <option [value]="c">{{ c }}</option> }
                    </select>
                    @if (isFieldInvalid('customerDetail', 'city')) { <span class="error-message">City is required.</span> }
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Pincode *</label>
                    <input type="number" class="pro-input" [class.is-invalid]="isFieldInvalid('customerDetail', 'pincode')" formControlName="pincode" placeholder="452001" />
                    @if (isFieldInvalid('customerDetail', 'pincode')) { <span class="error-message">Pincode is required.</span> }
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

      <!-- TAB 3: UPDATE CALL BY CALL NUMBER (DISTRIBUTOR & ADMIN) -->
      @if (activeTab === 'lookup') {
        <div class="card-form-wrapper animate-fade-in">
          <div class="form-card-header">
            <h3 class="form-card-title">{{ isDistributor ? 'Distributor Call Management & Update' : 'Quick Update by Call Number' }}</h3>
            <p class="form-card-subtitle">Search any Call Number to view details, update status, select pending parts, or submit closure requests</p>
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
              <!-- Summary Card Header -->
              <div class="found-call-summary">
                <div>
                  <span class="summary-id">{{ foundCall.callNumber || foundCall.callId || '#' + foundCall.id }}</span>
                  <h4 class="summary-name">{{ getCustomerName(foundCall) }} ({{ getCustomerPhone(foundCall) }})</h4>
                  <p class="summary-desc">
                    📦 {{ getProductName(getCallProduct(foundCall)) }} &bull; Model: {{ getModelName(getCallModel(foundCall)) }} &bull; {{ getCustomerAddress(foundCall) }}
                  </p>
                </div>
                <span class="status-badge" [ngClass]="getStatusClass(foundCall.status)">
                  {{ formatStatusDisplay(foundCall.status) }}
                </span>
              </div>

              <!-- Pending Approval Alert Box -->
              @if (isPendingApproval(foundCall)) {
                <div class="approval-alert-box animate-fade-in">
                  <div class="alert-icon">⏳</div>
                  <div class="alert-content">
                    <strong>Pending Customer Approval</strong>
                    <p>This call closure request has been submitted and is currently awaiting approval from the Customer.</p>
                  </div>
                </div>
              }

              <form [formGroup]="updateByIdForm" (ngSubmit)="onSaveQuickUpdate()">
                <div class="form-grid-2" style="margin-top: 1.25rem;">
                  <div class="pro-form-group">
                    <label class="pro-label">Call Status *</label>
                    <select class="pro-input" formControlName="status" (change)="onUpdateStatusChange()">
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="CLOSED">{{ isDistributor ? 'Closed (Request Customer Approval)' : 'Closed' }}</option>
                      <option value="PENDING_FOR_APPROVAL">Pending Approval</option>
                      <option value="PARTS_PENDING">Pending Parts</option>
                      <option value="REPLACEMENT">Replacement</option>
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

                <!-- 1. DYNAMIC SECTION: CANCELLED -->
                @if (updateByIdForm.get('status')?.value === 'CANCELLED') {
                  <div class="dynamic-status-section cancel-section animate-fade-in">
                    <div class="section-badge-header">
                      <span class="sec-badge sec-badge-danger">Cancellation Details</span>
                    </div>
                    <div class="form-grid-2">
                      <div class="pro-form-group">
                        <label class="pro-label">Cancellation Reason *</label>
                        <select class="pro-input" formControlName="cancellationReason">
                          <option value="">-- Select Cancellation Reason --</option>
                          @for (reason of cancellationReasons; track reason) {
                            <option [value]="reason">{{ reason }}</option>
                          }
                        </select>
                      </div>
                    </div>
                    @if (updateByIdForm.get('cancellationReason')?.value === 'Others' || updateByIdForm.get('cancellationReason')?.value === 'Other') {
                      <div class="pro-form-group animate-fade-in" style="margin-top: 0.75rem;">
                        <label class="pro-label">Cancellation Description (Required when Others is selected) *</label>
                        <textarea class="pro-input" formControlName="cancellationDescription" rows="2" placeholder="Please enter specific reason for cancellation..."></textarea>
                      </div>
                    }
                  </div>
                }

                <!-- 2. DYNAMIC SECTION: CLOSED / PENDING APPROVAL -->
                @if (updateByIdForm.get('status')?.value === 'CLOSED' || updateByIdForm.get('status')?.value === 'PENDING_FOR_APPROVAL') {
                  <div class="closure-notice-card animate-fade-in">
                    <div class="closure-notice-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                      </svg>
                    </div>
                    <div class="closure-notice-body">
                      <div class="closure-notice-title">Customer Approval Required</div>
                      <div class="closure-notice-desc">
                        Marking as <strong>Closed</strong> will send an approval request (<em>Pending Approval</em>) to the customer before the call is finalized.
                      </div>
                    </div>
                  </div>
                }

                <!-- 3. DYNAMIC SECTION: PENDING PARTS (Only for PARTS_PENDING) -->
                @if (updateByIdForm.get('status')?.value === 'PARTS_PENDING') {
                  <div class="dynamic-status-section parts-section animate-fade-in">
                    <div class="section-badge-header">
                      <span class="sec-badge sec-badge-primary">⚙️ Pending Spare Part Details</span>
                    </div>
                    
                    <div class="form-grid-1">
                      <div class="pro-form-group">
                        <label class="pro-label">Select Pending Part (For {{ getFoundCallProductName() }}) *</label>
                        <select class="pro-input highlight-select" formControlName="pendingPart">
                          <option value="">-- Choose Pending Part --</option>
                          @for (part of relevantProductParts; track part.id) {
                            <option [value]="part.id">{{ part.name }}</option>
                          }
                        </select>
                      </div>
                    </div>
                  </div>
                }

                <!-- 4. DYNAMIC SECTION: FULL PRODUCT REPLACEMENT (Only for REPLACEMENT) -->
                @if (updateByIdForm.get('status')?.value === 'REPLACEMENT') {
                  <div class="dynamic-status-section replacement-section animate-fade-in">
                    <div class="section-badge-header">
                      <span class="sec-badge sec-badge-primary">🔄 Product Unit Replacement</span>
                    </div>

                    <div class="form-grid-1">
                      <div class="pro-form-group">
                        <label class="pro-label">Select Replacement Product (Associated with {{ getFoundCallBrandName() }}) *</label>
                        <select class="pro-input highlight-select" formControlName="requiredProduct">
                          <option value="">-- Choose Replacement Product --</option>
                          @for (p of getBrandProductsForFoundCall(); track p.id) {
                            <option [value]="p.id">{{ p.name }} (Code: {{ p.productCode || p.product_code || 'PRD-' + p.id }})</option>
                          }
                        </select>
                      </div>
                    </div>
                  </div>
                }

                <!-- Technician & Remarks Row -->
                <div class="form-grid-2" style="margin-top: 1rem;">
                  <div class="pro-form-group">
                    <label class="pro-label">Assigned Technician</label>
                    <input type="text" class="pro-input" formControlName="technicianAssigned" placeholder="Enter technician name" />
                  </div>
                  <div class="pro-form-group">
                    <label class="pro-label">Remarks / Update Notes</label>
                    <input type="text" class="pro-input" formControlName="remarks" placeholder="Enter update notes or remarks" />
                  </div>
                </div>

                <!-- Image Upload (Optional) -->
                <div class="pro-form-group" style="margin-top: 1rem;">
                  <label class="pro-label">Attach Update Photo (optional)</label>
                  <div class="image-upload-zone" (click)="quickImageInput.click()" [class.has-image]="quickUpdatePreviewUrl">
                    @if (quickUpdatePreviewUrl) {
                      <img [src]="quickUpdatePreviewUrl" class="upload-preview-img" alt="Preview" />
                      <button type="button" class="remove-img-btn" (click)="$event.stopPropagation(); clearQuickImage()">&#x2715; Remove</button>
                    } @else {
                      <div class="upload-placeholder">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <span>Click to attach photo</span>
                        <span class="upload-hint">JPG, PNG, WEBP up to 5MB</span>
                      </div>
                    }
                  </div>
                  <input #quickImageInput type="file" accept="image/*" style="display:none" (change)="onQuickUpdateImageChange($event)" />
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.25rem;">
                  <button type="submit" class="btn-save" [disabled]="isSubmitting">
                    {{ isSubmitting ? 'Saving...' : 'Save Call Update' }}
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
                
                <!-- Customer Closure Approval Banner -->
                @if (isCustomer && isPendingApproval(viewingCallDetails)) {
                  <div class="customer-approval-card animate-fade-in">
                    <div class="customer-approval-content">
                      <div class="customer-approval-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                      </div>
                      <div class="customer-approval-text">
                        <div class="customer-approval-title">Closure Approval Requested</div>
                        <div class="customer-approval-desc">
                          The distributor has completed work on this service call. Please review and confirm closure.
                        </div>
                      </div>
                    </div>
                    <button type="button" class="btn-customer-approve" (click)="approveCallClosure(viewingCallDetails)" [disabled]="isSubmitting">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Approve & Close Call
                    </button>
                  </div>
                }

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
              @if (isCustomer && isPendingApproval(viewingCallDetails)) {
                <button type="button" class="btn-approve" (click)="approveCallClosure(viewingCallDetails)" [disabled]="isSubmitting">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Approve Closure
                </button>
              }
              @if (!isCustomer && !isCallClosed(viewingCallDetails)) {
                <button type="button" class="btn-save" (click)="startEditFromDetails(viewingCallDetails)">
                  {{ isDistributor ? 'Update Call' : 'Edit Call' }}
                </button>
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
                      <label class="pro-label">Address Line 1 *</label>
                      <input type="text" class="pro-input" [class.is-invalid]="isEditFieldInvalid('customerDetail', 'address1')" formControlName="address1" placeholder="Address line 1" />
                      @if (isEditFieldInvalid('customerDetail', 'address1')) { <span class="error-message">Address is required.</span> }
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">Landmark</label>
                      <input type="text" class="pro-input" formControlName="landmark" placeholder="Landmark" />
                    </div>
                  </div>

                  <div class="form-grid-2">
                    <div class="pro-form-group">
                      <label class="pro-label">Locality *</label>
                      <input type="text" class="pro-input" [class.is-invalid]="isEditFieldInvalid('customerDetail', 'locality')" formControlName="locality" placeholder="Locality" />
                      @if (isEditFieldInvalid('customerDetail', 'locality')) { <span class="error-message">Locality is required.</span> }
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">City *</label>
                      <input type="text" class="pro-input" [class.is-invalid]="isEditFieldInvalid('customerDetail', 'city')" formControlName="city" placeholder="City" />
                      @if (isEditFieldInvalid('customerDetail', 'city')) { <span class="error-message">City is required.</span> }
                    </div>
                  </div>

                  <div class="form-grid-3">
                    <div class="pro-form-group">
                      <label class="pro-label">District *</label>
                      <input type="text" class="pro-input" [class.is-invalid]="isEditFieldInvalid('customerDetail', 'district')" formControlName="district" placeholder="District" />
                      @if (isEditFieldInvalid('customerDetail', 'district')) { <span class="error-message">District is required.</span> }
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">State *</label>
                      <input type="text" class="pro-input" [class.is-invalid]="isEditFieldInvalid('customerDetail', 'state')" formControlName="state" placeholder="State" />
                      @if (isEditFieldInvalid('customerDetail', 'state')) { <span class="error-message">State is required.</span> }
                    </div>
                    <div class="pro-form-group">
                      <label class="pro-label">Pincode *</label>
                      <input type="number" class="pro-input" [class.is-invalid]="isEditFieldInvalid('customerDetail', 'pincode')" formControlName="pincode" placeholder="452001" />
                      @if (isEditFieldInvalid('customerDetail', 'pincode')) { <span class="error-message">Pincode is required.</span> }
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

    .btn-row-approve {
      padding: 0.35rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 700;
      background: linear-gradient(135deg, #16a34a, #15803d);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.15s;
    }
    .btn-row-approve:hover {
      background: #15803d;
      transform: translateY(-1px);
    }
    .btn-approve {
      padding: 0.6rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 700;
      background: linear-gradient(135deg, #16a34a, #15803d);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.15s;
    }
    .btn-approve:hover { background: #15803d; }
    .btn-approve:disabled { opacity: 0.6; cursor: not-allowed; }

    .status-approval { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .status-cancelled { background: #ffe4e6; color: #e11d48; border: 1px solid #fecdd3; }
    .status-parts { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
    .status-replacement { background: #ede9fe; color: #6d28d9; border: 1px solid #ddd6fe; }

    .approval-alert-box {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      background: #fffbeb;
      border: 1.5px solid #fde68a;
      border-radius: 10px;
      padding: 0.85rem 1.1rem;
      margin-top: 1rem;
    }
    .approval-alert-box .alert-icon { font-size: 1.4rem; }
    .approval-alert-box strong { color: #92400e; font-size: 0.9rem; display: block; }
    .approval-alert-box p { color: #b45309; font-size: 0.8rem; margin: 0.15rem 0 0; }

    .dynamic-status-section {
      background: #f8fafc;
      border: 1.5px solid var(--border);
      border-radius: 10px;
      padding: 1.1rem;
      margin-top: 1rem;
    }
    .cancel-section { border-color: #fecdd3; background: #fff1f2; }
    .info-section { border-color: #e0e7ff; background: #eef2ff; }
    .parts-section { border-color: #bae6fd; background: #f0f9ff; }

    .section-badge-header { margin-bottom: 0.75rem; }
    .sec-badge { font-size: 0.725rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.2rem 0.55rem; border-radius: 6px; }
    .sec-badge-danger { background: #fee2e2; color: #dc2626; }
    .sec-badge-primary { background: #e0f2fe; color: #0284c7; }

    .customer-approval-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.25rem;
      padding: 1rem 1.25rem;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-left: 4px solid #16a34a;
      border-radius: 10px;
      margin-bottom: 1.25rem;
    }
    .customer-approval-content {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      flex: 1;
    }
    .customer-approval-icon {
      color: #16a34a;
      background: #dcfce7;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .customer-approval-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: #14532d;
      margin-bottom: 0.15rem;
    }
    .customer-approval-desc {
      font-size: 0.8rem;
      color: #166534;
      line-height: 1.4;
    }
    .btn-customer-approve {
      padding: 0.65rem 1.25rem;
      font-size: 0.86rem;
      font-weight: 600;
      background: #16a34a;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
      transition: all 0.15s ease;
      box-shadow: 0 1px 3px rgba(22, 163, 74, 0.25);
    }
    .btn-customer-approve:hover {
      background: #15803d;
      transform: translateY(-1px);
      box-shadow: 0 3px 6px rgba(22, 163, 74, 0.3);
    }
    .btn-customer-approve:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .closure-notice-card {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      padding: 0.9rem 1.1rem;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-left: 4px solid #16a34a;
      border-radius: 8px;
      margin-top: 1rem;
    }
    .closure-notice-icon {
      color: #16a34a;
      flex-shrink: 0;
      margin-top: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .closure-notice-body {
      flex: 1;
    }
    .closure-notice-title {
      font-size: 0.84rem;
      font-weight: 700;
      color: #15803d;
      margin-bottom: 0.2rem;
      letter-spacing: -0.01em;
    }
    .closure-notice-desc {
      font-size: 0.8rem;
      color: #166534;
      line-height: 1.45;
    }
    .closure-notice-desc strong {
      font-weight: 600;
      color: #14532d;
    }

    .parts-list-container { margin-top: 0.5rem; }
    .empty-parts-hint { font-size: 0.8rem; color: #94a3b8; font-style: italic; margin: 0; }
    .parts-chip-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.65rem; margin-top: 0.4rem; }
    .part-chip-card {
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.65rem 0.85rem;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .part-chip-card:hover { border-color: #0284c7; background: #f0f9ff; transform: translateY(-1px); }
    .part-chip-card.selected { border-color: #0284c7; background: #e0f2fe; box-shadow: 0 0 0 2px rgba(2,132,199,0.2); }
    .chip-name { font-size: 0.825rem; font-weight: 700; color: var(--text-primary); }
    .chip-desc { font-size: 0.725rem; color: #64748b; margin-top: 0.15rem; }
    .chip-action { font-size: 0.7rem; font-weight: 800; color: #0284c7; margin-top: 0.35rem; }

    .replacement-chip-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.65rem; margin-top: 0.4rem; }
    .replacement-card { display: flex; align-items: center; gap: 0.5rem; background: #ffffff; border: 1.5px dashed #cbd5e1; border-radius: 8px; padding: 0.55rem 0.75rem; }
    .rep-icon { font-size: 1.1rem; }
    .rep-details { display: flex; flex-direction: column; }
    .rep-name { font-size: 0.8rem; font-weight: 700; color: var(--text-primary); }
    .rep-sub { font-size: 0.7rem; color: #64748b; }

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
  private productPartService = inject(ProductPartService);
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
  productParts: ProductPart[] = [];
  relevantProductParts: ProductPart[] = [];
  relevantReplacementParts: any[] = [];

  cancellationReasons: string[] = [
    'Not required service / complaint cancel by customer',
    'Customer not responding / number not reachable or switched off',
    'Customer does not have bill or document',
    'Customer out of station',
    'Duplicate complaints',
    'Damage / Defective product',
    'Not repairable at home, so visit at shop',
    'Customer went to dealer shop for service',
    'Not ready to pay for spare/service',
    'Product is not repairable',
    'Customer did not register the complaint',
    'Wrong address',
    'Wrong contact number',
    'Old product, Spare not available',
    'Replacement / unavailability of product',
    'Sales Enquiry',
    'Call resolved over phone.',
    'Unit working fine, no visit required.',
    'Others'
  ];

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
  isAdmin = false;
  isCustomer = false;
  isDistributor = false;
  customerBrandId: number | null = null;

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
      address1: ['', Validators.required],
      landmark: [''],
      state: ['', Validators.required],
      district: ['', Validators.required],
      city: ['', Validators.required],
      locality: ['', Validators.required],
      pincode: ['', Validators.required]
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
      address1: ['', Validators.required],
      landmark: [''],
      state: ['', Validators.required],
      district: ['', Validators.required],
      city: ['', Validators.required],
      locality: ['', Validators.required],
      pincode: ['', Validators.required]
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
    status: ['OPEN'],
    priority: ['Medium'],
    technicianAssigned: [''],
    remarks: [''],
    cancellationReason: [''],
    cancellationDescription: [''],
    requiredProduct: [''],
    pendingPart: ['']
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
    const role = (this.authService.getRole() || '').toLowerCase();
    this.isAdmin = role === 'admin';
    this.isCustomer = role === 'customer';
    this.isDistributor = role === 'distributor';
    this.customerBrandId = this.authService.getBrandId();
    this.sanitizeLocalStorage();
    this.states = Object.keys(this.statesData).sort();
    this.route.queryParams.subscribe(params => {
      if (params['tab'] && ['list', 'create', 'lookup'].includes(params['tab'])) {
        if (this.isDistributor && params['tab'] === 'create') {
          this.activeTab = 'list';
        } else {
          this.activeTab = params['tab'];
        }
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
    this.loadBrands();
    this.loadProducts();
    this.loadModels();
    this.loadIssues();
    this.loadParts();
    this.loadCalls();
  }

  loadParts() {
    this.productPartService.getProductParts().subscribe({
      next: (res: any) => this.productParts = this.parseArray(res),
      error: () => this.productParts = []
    });
  }

  loadRelevantPartsForCall(call: any) {
    if (!call) {
      this.relevantProductParts = [];
      this.relevantReplacementParts = [];
      return;
    }
    const rawProd = call.requiredProduct || call.productDetail?.product || call.product || (typeof call.productDetail === 'object' ? call.productDetail?.id : null);
    const prodId = (typeof rawProd === 'object' && rawProd?.id) ? Number(rawProd.id) : (isNaN(Number(rawProd)) ? null : Number(rawProd));

    if (prodId) {
      this.updateByIdForm.patchValue({ requiredProduct: prodId });
      this.productPartService.getProductParts(prodId).subscribe({
        next: (res: any) => {
          const parts = this.parseArray(res);
          this.relevantProductParts = parts.filter((p: any) => {
            const pProd = p.product ?? p.product_id;
            const pNum = (typeof pProd === 'object' && pProd?.id) ? Number(pProd.id) : Number(pProd);
            return pNum === prodId;
          });
          if (!this.relevantProductParts.length && parts.length > 0) {
            this.relevantProductParts = parts;
          }
          this.relevantReplacementParts = this.relevantProductParts.map(p => ({
            id: p.id,
            name: `${p.name} (OEM Replacement)`,
            description: p.description || 'Compatible replacement component'
          }));
        },
        error: () => {
          this.relevantProductParts = this.productParts.filter((p: any) => {
            const pProd = p.product ?? p.product_id;
            const pNum = (typeof pProd === 'object' && pProd?.id) ? Number(pProd.id) : Number(pProd);
            return pNum === prodId;
          });
          this.relevantReplacementParts = this.relevantProductParts.map(p => ({
            id: p.id,
            name: `${p.name} (OEM Replacement)`,
            description: p.description || 'Compatible replacement component'
          }));
        }
      });
    } else {
      this.relevantProductParts = [...this.productParts];
      this.relevantReplacementParts = this.relevantProductParts.map(p => ({
        id: p.id,
        name: `${p.name} (OEM Replacement)`,
        description: p.description || 'Compatible replacement component'
      }));
    }
  }

  getBrandProductsForFoundCall(): any[] {
    if (!this.foundCall) return this.products;
    const callAny = this.foundCall as any;
    const rawBrand = callAny.productDetail?.brand ?? callAny.brand ?? callAny.brand_id;
    const brandId = (typeof rawBrand === 'object' && rawBrand?.id) ? Number(rawBrand.id) : (rawBrand ? Number(rawBrand) : null);
    
    if (brandId) {
      const brandFiltered = this.products.filter((p: any) => {
        const pBrand = p.brand ?? p.brand_id ?? p.brandId;
        const pBrandId = (typeof pBrand === 'object' && pBrand?.id) ? Number(pBrand.id) : Number(pBrand);
        return pBrandId === brandId;
      });
      if (brandFiltered.length > 0) return brandFiltered;
    }
    return this.products;
  }

  getFoundCallBrandName(): string {
    if (!this.foundCall) return 'Brand';
    const callAny = this.foundCall as any;
    const rawBrand = callAny.productDetail?.brand ?? callAny.brand ?? callAny.brand_id;
    if (typeof rawBrand === 'object' && rawBrand?.name) return rawBrand.name;
    const bId = (typeof rawBrand === 'object' && rawBrand?.id) ? Number(rawBrand.id) : Number(rawBrand);
    if (bId) {
      const found = this.brands.find(b => Number(b.id) === bId);
      if (found?.name) return found.name;
    }
    return 'Assigned Brand';
  }

  getFoundCallProductName(): string {
    if (!this.foundCall) return 'Product';
    const callAny = this.foundCall as any;
    const rawProd = callAny.productDetail?.product ?? callAny.product ?? callAny.requiredProduct;
    if (typeof rawProd === 'object' && rawProd?.name) return rawProd.name;
    const pId = (typeof rawProd === 'object' && rawProd?.id) ? Number(rawProd.id) : Number(rawProd);
    if (pId) {
      const found = this.products.find(p => Number(p.id) === pId);
      if (found?.name) return found.name;
    }
    return 'Product';
  }

  onRequiredProductChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    const prodId = Number(val);
    if (prodId) {
      this.productPartService.getProductParts(prodId).subscribe({
        next: (res: any) => {
          this.relevantProductParts = this.parseArray(res).filter((p: any) => {
            const pProd = p.product ?? p.product_id;
            const pNum = (typeof pProd === 'object' && pProd?.id) ? Number(pProd.id) : Number(pProd);
            return pNum === prodId;
          });
          this.relevantReplacementParts = this.relevantProductParts.map(p => ({
            id: p.id,
            name: `${p.name} (OEM Replacement)`,
            description: p.description || 'Compatible replacement component'
          }));
        }
      });
    } else {
      this.relevantProductParts = [];
      this.relevantReplacementParts = [];
    }
  }

  onUpdateStatusChange() {
    const st = String(this.updateByIdForm.get('status')?.value || '').toUpperCase();
    if (st === 'PARTS_PENDING' && this.foundCall) {
      this.loadRelevantPartsForCall(this.foundCall);
    } else if (st === 'REPLACEMENT') {
      this.updateByIdForm.patchValue({ pendingPart: null });
      this.relevantProductParts = [];
      this.relevantReplacementParts = [];
    }
  }

  formatStatusDisplay(status?: string): string {
    if (!status) return 'Open';
    const s = String(status).trim();
    if (s === 'OPEN') return 'Open';
    if (s === 'IN_PROGRESS') return 'In Progress';
    if (s === 'COMPLETED') return 'Completed';
    if (s === 'CLOSED') return 'Closed';
    if (s === 'CANCELLED') return 'Cancelled';
    if (s === 'PENDING_FOR_APPROVAL' || s === 'pending_for_approval') return 'Pending Approval';
    if (s === 'Parts_Pending' || s === 'PARTS_PENDING') return 'Pending Parts';
    if (s === 'Replacement' || s === 'REPLACEMENT') return 'Replacement';
    return s;
  }

  isPendingApproval(call: any): boolean {
    if (!call) return false;
    const s = (call.status || '').toUpperCase().trim().replace(/[\s_-]+/g, '');
    return s === 'PENDINGFORAPPROVAL' || s === 'PENDINGAPPROVAL';
  }

  isCurrentStatusExtra(status?: string): boolean {
    if (!status) return false;
    const s = String(status).trim().toUpperCase();
    return s === 'OPEN' || s === 'IN_PROGRESS' || s === 'PENDING_FOR_APPROVAL' || s === 'REPLACEMENT';
  }

  loadBrands() {
    this.brandService.getBrands().subscribe({
      next: (res: any) => {
        let all = this.parseArray(res);
        if (this.isCustomer && this.customerBrandId) {
          // Customer sees only their own brand
          const brandId = Number(this.customerBrandId);
          all = all.filter((b: any) => Number(b.id) === brandId);
        }
        this.brands = all;
        // For customer: auto-set the brand in create form and filter products
        if (this.isCustomer && this.customerBrandId && all.length > 0) {
          const brandId = Number(this.customerBrandId);
          this.callForm.get('productDetail')?.patchValue({ brand: brandId });
          this.filteredProducts = this.products.filter((p: any) => {
            const rawB = p.brand ?? p.brand_id ?? p.brandId;
            const bNum = (typeof rawB === 'object' && rawB?.id) ? Number(rawB.id) : Number(rawB);
            return bNum === brandId;
          });
        }
      },
      error: () => this.brands = []
    });
  }

  getEffectiveCustomerBrandId(): any {
    if (this.customerBrandId !== null && this.customerBrandId !== undefined) {
      const num = Number(this.customerBrandId);
      if (!isNaN(num) && num > 0) return num;
    }
    // Fall back to localStorage brand
    const stored = localStorage.getItem('crm_brand_id');
    if (stored) {
      const num = Number(stored);
      return isNaN(num) ? stored : num;
    }
    return null;
  }

  /** Returns a user-specific localStorage key for this customer's created calls */
  private myCreatedCallsKey(): string {
    const uid = this.authService.getUserId();
    return uid ? `crm_my_created_calls_${uid}` : 'crm_my_created_calls_anon';
  }

  /** Persist the call number key so we can always show it to the customer who created it */
  private persistCreatedCallKey(callKey: string) {
    try {
      if (!callKey || callKey === 'undefined') return;
      const storageKey = this.myCreatedCallsKey();
      const existing: string[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (!existing.includes(callKey)) {
        existing.push(callKey);
        // Keep last 200 entries
        const trimmed = existing.slice(-200);
        localStorage.setItem(storageKey, JSON.stringify(trimmed));
      }
    } catch (e) {}
  }

  /** Returns true if this call was created by the logged-in customer */
  private isMyCreatedCall(c: any): boolean {
    try {
      const myKeys: string[] = JSON.parse(localStorage.getItem(this.myCreatedCallsKey()) || '[]');
      const candidates = [c.callNumber, c.callId, c.call_number, c.id ? String(c.id) : null].filter(Boolean);
      return candidates.some(k => myKeys.includes(String(k)));
    } catch (e) { return false; }
  }

  /** Remove all locally stored draft/broken calls that were never properly saved to the backend */
  clearBrokenLocalCalls() {
    try {
      const storageKey = this.myCreatedCallsKey();
      const detailsMap = JSON.parse(localStorage.getItem('crm_call_details_map') || '{}');
      const myKeys: string[] = JSON.parse(localStorage.getItem(storageKey) || '[]');

      // Keep only keys that have complete backend-confirmed data
      const cleanedKeys: string[] = [];
      for (const key of myKeys) {
        const raw = detailsMap[key] || detailsMap[key.toLowerCase()];
        if (!raw) continue; // no data at all — remove
        if (raw.status === 400 || raw.status === '400') continue; // error call — remove
        if (!raw.complaintDetail && !raw.complaint_detail) continue; // incomplete — remove
        if (!raw.status) continue; // missing status — remove
        cleanedKeys.push(key);
      }

      localStorage.setItem(storageKey, JSON.stringify(cleanedKeys));
      this.showToast('Broken local draft calls cleared successfully.', true);
      this.loadCalls();
    } catch (e) {
      this.showToast('Could not clear local calls.', false);
    }
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        let all = this.parseArray(res);
        if (this.isCustomer && this.customerBrandId) {
          // Customer sees only products belonging to their brand
          const brandId = Number(this.customerBrandId);
          all = all.filter((p: any) => {
            const rawB = p.brand ?? p.brand_id ?? p.brandId;
            const bNum = (typeof rawB === 'object' && rawB?.id) ? Number(rawB.id) : Number(rawB);
            return bNum === brandId;
          });
        }
        this.products = all;
        // Refresh filteredProducts if brand is already selected in form
        if (this.isCustomer && this.customerBrandId) {
          const brandId = Number(this.customerBrandId);
          this.filteredProducts = all; // already filtered to customer's brand
          this.callForm.get('productDetail')?.patchValue({ brand: brandId });
        }
      },
      error: () => this.products = []
    });
  }

  loadModels() {
    this.modelService.getProductModels().subscribe({
      next: (res: any) => this.models = this.parseArray(res),
      error: () => this.models = []
    });
  }

  loadIssues() {
    this.issueService.getProductIssues().subscribe({
      next: (res: any) => this.issues = this.parseArray(res),
      error: () => this.issues = []
    });
  }

  loadCalls() {
    this.loading = true;
    this.errorMessage = '';
    // Auto-clean broken local drafts before loading
    try {
      const storageKey = this.myCreatedCallsKey();
      const detailsMap = JSON.parse(localStorage.getItem('crm_call_details_map') || '{}');
      const myKeys: string[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const cleanedKeys = myKeys.filter(key => {
        const raw = detailsMap[key] || detailsMap[key.toLowerCase()];
        if (!raw) return false;
        if (raw.status === 400 || raw.status === '400') return false;
        if (!raw.complaintDetail && !raw.complaint_detail) return false;
        if (!raw.status) return false;
        return true;
      });
      localStorage.setItem(storageKey, JSON.stringify(cleanedKeys));
    } catch (e) {}
    this.callService.getCalls().subscribe({
      next: (res: any) => {
        const raw = this.parseArray(res);
        // Show ALL calls from backend — backend already filters by user/brand
        let mapped = raw.map((c: any) => this.normalizeCall(c));

        // Build set of all backend-confirmed call identifiers
        const backendKeys = new Set<string>();
        raw.forEach((c: any) => {
          [c.callNumber, c.callId, c.call_number, c.id ? String(c.id) : null]
            .filter(Boolean)
            .forEach((k: string) => backendKeys.add(String(k)));
        });

        // Remove any locally stored call keys NOT confirmed by backend
        if (this.isCustomer) {
          try {
            const storageKey = this.myCreatedCallsKey();
            const myKeys: string[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const confirmedKeys = myKeys.filter(k => backendKeys.has(k));
            localStorage.setItem(storageKey, JSON.stringify(confirmedKeys));
          } catch (e) {}

          mapped = this.mergeLocalCreatedCalls(mapped);
        }

        this.calls = mapped;
        this.loading = false;
        this.loadAllCachedImages(mapped);
      },
      error: (err: any) => {
        console.error('Failed to load calls from backend:', err);
        const fallbackCalls = this.isCustomer ? this.mergeLocalCreatedCalls([]) : [];
        this.calls = fallbackCalls;
        this.loading = false;
        if (!fallbackCalls.length) {
          this.errorMessage = 'Could not load calls from server. Please check your connection and try again.';
        }
      }
    });
  }



  /**
   * Preserves customer's locally-created calls across refresh,
   * strictly ensuring only calls matching the customer's brand are shown.
   */
  private mergeLocalCreatedCalls(existing: any[]): any[] {
    try {
      const myKeys: string[] = JSON.parse(localStorage.getItem(this.myCreatedCallsKey()) || '[]');
      if (!myKeys.length) return existing;

      const detailsMap = JSON.parse(localStorage.getItem('crm_call_details_map') || '{}');
      const presentKeys = new Set<string>();
      existing.forEach(c => {
        [c.callNumber, c.callId, c.call_number, c.id ? String(c.id) : null]
          .filter(Boolean)
          .forEach(k => presentKeys.add(String(k)));
      });

      const brandId = this.customerBrandId ? Number(this.customerBrandId) : null;
      const toAdd: any[] = [];

      for (const key of myKeys) {
        if (presentKeys.has(key)) continue;

        const raw = detailsMap[key] || detailsMap[key.toLowerCase()];
        if (!raw) continue;
        
        // Skip corrupted calls that saved backend error codes as status
        if (raw.status === 400 || raw.status === '400') continue;

        const call = this.normalizeCall(raw);

        toAdd.push(call);
        presentKeys.add(key);
      }
      return [...toAdd, ...existing];
    } catch (e) {
      return existing;
    }
  }

  normalizeStatus(status?: string): string {
    if (!status) return 'Open';
    const s = String(status).trim().toUpperCase().replace(/[\s_-]+/g, '');
    if (s === 'OPEN' || s === 'PENDING') return 'Open';
    if (s === 'INPROGRESS') return 'In Progress';
    if (s === 'RESOLVED' || s === 'COMPLETED') return 'Completed';
    if (s === 'CLOSED') return 'Closed';
    if (s === 'CANCELLED' || s === 'CANCELED') return 'Cancelled';
    if (s === 'PENDINGFORAPPROVAL' || s === 'PENDINGAPPROVAL') return 'Pending Approval';
    if (s === 'PARTSPENDING') return 'Pending Parts';
    if (s === 'REPLACEMENT') return 'Replacement';
    return status;
  }

  mapToBackendStatus(status: string): string {
    const s = this.normalizeStatus(status);
    const map: { [key: string]: string } = {
      'Open': 'OPEN',
      'In Progress': 'IN_PROGRESS',
      'Completed': 'COMPLETED',
      'Cancelled': 'CANCELLED',
      'Closed': 'CLOSED',
      'Pending Approval': 'PENDING_FOR_APPROVAL',
      'Pending Parts': 'PARTS_PENDING',
      'Parts_Pending': 'PARTS_PENDING',
      'Replacement': 'REPLACEMENT'
    };
    return map[s] || s;
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
    if (clone.imageUrl && String(clone.imageUrl).startsWith('data:')) clone.imageUrl = 'indexeddb';
    if (clone.image && String(clone.image).startsWith('data:')) clone.image = 'indexeddb';
    return clone;
  }

  private saveCallOverride(callNum: string, id?: any, data?: Partial<Call>) {
    try {
      const map = this.getUpdatedCallMap();
      const updatedData = data ? this.cleanCallForLocalStorage(data) : data;
      const cleanNum = callNum.replace(/^#/, '').trim();

      map[callNum] = updatedData;
      map[cleanNum] = updatedData;
      map[callNum.toLowerCase()] = updatedData;

      if (id) {
        const idStr = String(id);
        const cleanIdStr = idStr.replace(/^#/, '').trim();
        map[idStr] = updatedData;
        map[cleanIdStr] = updatedData;
        map[idStr.toLowerCase()] = updatedData;
      }
      localStorage.setItem('crm_updated_calls_map', JSON.stringify(map));
    } catch (e) {
      console.warn('Could not persist call override in localStorage', e);
    }
  }

  private saveCallDetails(callNumber: string, details: any) {
    try {
      const cleaned = this.cleanCallForLocalStorage(details);
      const store = JSON.parse(localStorage.getItem('crm_call_details_map') || '{}');
      const keys = [callNumber, callNumber.toLowerCase()];
      keys.forEach(k => { if (k) store[k] = cleaned; });
      localStorage.setItem('crm_call_details_map', JSON.stringify(store));
    } catch (e) {}
  }

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
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
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
      this.calls = [...this.calls];
    }
  }

  saveCallImage(key: string | number, dataUrl: string | null, altKey?: string | number) {
    if (!dataUrl) return;
    const strKey = String(key);
    
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
    try {
      const map = JSON.parse(localStorage.getItem('crm_call_images_map') || '{}');
      if (dataUrl === 'REMOVED') {
        map[strKey] = 'REMOVED';
        if (altKey) map[String(altKey)] = 'REMOVED';
        localStorage.setItem('crm_call_images_map', JSON.stringify(map));
      } else if (dataUrl.length < 50000) {
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

    const path = (call.imageUrl || call.image || call.callImage || call.call_image || call.attachment) as string;
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return `http://localhost:8000${cleanPath}`;
  }

  normalizeCall(c: any): Call {
    if (!c) return {} as Call;

    const rawId = c.id ? String(c.id) : undefined;
    const rawNum = c.callNumber || c.callId || c.call_number;
    const cNum = rawNum ? String(rawNum) : (rawId ? `CN${rawId.padStart(6, '0')}` : `CN${Math.floor(100000 + Math.random() * 900000)}`);

    const updateMap = this.getUpdatedCallMap();
    const override = (cNum ? updateMap[cNum] || updateMap[cNum.toLowerCase()] : null) || (rawId ? updateMap[rawId] || updateMap[rawId.toLowerCase()] : null);

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
    let rawBrand = c.brand ?? c.brand_id ?? productObj.brand ?? productObj.brand_id ?? persisted.brand;
    let bId: number | string | null = null;
    if (rawBrand !== null && rawBrand !== undefined) {
      if (typeof rawBrand === 'object' && rawBrand.id) {
        bId = Number(rawBrand.id);
      } else if (!isNaN(Number(rawBrand))) {
        bId = Number(rawBrand);
      } else {
        bId = String(rawBrand);
      }
    }
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
      customerDetail: customerObj,
      contactDetail: contactObj,
      productDetail: productObj,
      complaintDetail: complaintObj,
      dealerDetail: dealerObj
    };
  }

  /* ── CREATE FORM HELPERS ─────────── */
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

  buildCallPayload(val: any, existingId?: string | number): any {
    const cust = val.customerDetail || {};
    const cont = val.contactDetail || {};
    const deal = val.dealerDetail || {};
    const prod = val.productDetail || {};
    const comp = val.complaintDetail || {};

    const todayStr = new Date().toISOString().slice(0, 10);
    const languages = Array.isArray(cont.language) ? cont.language : (cont.language ? String(cont.language).split(',').map((s: string) => s.trim()).filter(Boolean) : []);
    const statusVal = this.createStatus || 'Open';
    const techVal = this.createTechnicianAssigned || 'Unassigned';

    const fn = (cust.firstName && cust.firstName !== 'N/A') ? cust.firstName.trim() : '';
    const ln = (cust.lastName && cust.lastName.trim() && cust.lastName !== 'N/A' && cust.lastName !== '.') ? cust.lastName.trim() : '';
    const custName = `${fn} ${ln}`.trim() || 'Customer';

    const custPhone = cont.mobile || cont.phone || '';
    const addr = `${cust.address1 || ''} ${cust.landmark || ''} ${cust.locality || ''} ${cust.city || ''} ${cust.state || ''} ${cust.pincode || ''}`.replace(/\s+/g, ' ').trim();
    const currentUserId = this.authService.getUserId() || 1;

    const autoCallNum = `CN${Math.floor(100000 + Math.random() * 900000)}`;
    const effectiveBrand = this.getEffectiveCustomerBrandId() || Number(prod.brand) || 1;

    // Ensure product detail always has a brand
    prod.brand = effectiveBrand;

    return {
      callNumber: autoCallNum,
      callId: autoCallNum,
      call_number: autoCallNum,
      user: currentUserId,
      user_id: currentUserId,
      created_by: currentUserId,
      customer_id: currentUserId,
      customerDetail: {
        title: cust.title || 'Mr',
        firstName: fn,
        lastName: ln,
        address1: cust.address1 || '',
        landmark: cust.landmark || '',
        state: cust.state || '',
        district: cust.district || '',
        city: cust.city || '',
        locality: cust.locality || '',
        pincode: cust.pincode || ''
      },
      contactDetail: {
        mobile: cont.mobile || '',
        email: cont.email || '',
        contactPersonName: cont.contactPersonName || '',
        contactPersonMobile: cont.contactPersonMobile || '',
        language: languages
      },
      dealerDetail: deal,
      productDetail: prod,
      complaintDetail: comp,
      status: this.mapToBackendStatus(statusVal),
      callStatus: this.mapToBackendStatus(statusVal),
      call_status: this.mapToBackendStatus(statusVal),
      technicianAssigned: techVal,
      createdAt: todayStr,

      customerName: custName,
      customerPhone: custPhone,
      address: addr,
      brand: effectiveBrand,
      brand_id: effectiveBrand,
      product: Number(prod.product) || 1,
      model: Number(prod.model) || 1,
      priority: comp.complaintPriority || 'Medium',
      remarks: comp.complaintDescription || comp.specialInstruction || ''
    };
  }

  /* ── Formats raw backend validation JSON into clean user-friendly text ── */
  private formatBackendErrorMessage(errorData: any): string {
    if (!errorData) return 'Please check all required fields and try again.';
    if (typeof errorData === 'string') return errorData;

    const fieldLabels: { [key: string]: string } = {
      dealerMobile: 'Dealer Mobile Number',
      dealerName: 'Dealer Name',
      dealerCity: 'Dealer City',
      dealerEmail: 'Dealer Email',
      invoiceNumber: 'Invoice Number',
      purchaseDate: 'Purchase Date',
      contactPersonName: 'Contact Person Name',
      contactPersonMobile: 'Contact Person Mobile',
      firstName: 'Customer First Name',
      lastName: 'Customer Last Name',
      address1: 'Address',
      pincode: 'Pincode',
      mobile: 'Mobile Number',
      brand: 'Brand',
      product: 'Product',
      model: 'Model',
      callType: 'Call Type / Issue'
    };

    const missingFields: string[] = [];
    const collectErrors = (obj: any) => {
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (Array.isArray(val)) {
          const label = fieldLabels[key] || key;
          missingFields.push(label);
        } else if (typeof val === 'object' && val !== null) {
          collectErrors(val);
        } else if (typeof val === 'string') {
          const label = fieldLabels[key] || key;
          missingFields.push(label);
        }
      }
    };

    collectErrors(errorData);

    if (missingFields.length > 0) {
      return `Please fill in the required field(s): ${missingFields.join(', ')}.`;
    }

    return 'Please fill in all mandatory fields before submitting.';
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

      // Handle backend returning 200 OK but with a 400 error body
      if (!isError && apiRes && (apiRes.status === 400 || apiRes.error)) {
        this.isSubmitting = false;
        const errObj = apiRes.error || apiRes.message || 'Validation error';
        const friendlyMsg = this.formatBackendErrorMessage(errObj);
        this.showToast(friendlyMsg, false);
        return; // Don't save locally on validation errors
      }

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
        this.persistCreatedCallKey(cNum);
        this.showToast('Call saved locally (Network Error)', false);
      } else {
        // Backend returns {status: 200, message: 'success'} — strip HTTP metadata
        // so it doesn't overwrite actual call fields like status='OPEN'
        const rawRes = apiRes || {};
        const { status: _httpStatus, message: _httpMsg, ...callData } = rawRes;

        // If backend returned actual call data (like callNumber), use it; otherwise use frontend data
        const finalCall = Object.keys(callData).length > 0 ? callData : {};

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

        // Merge: newCall first (has real call data), then any backend-returned call fields on top
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

        // Persist created call key so filter always passes it through on future loads
        this.persistCreatedCallKey(String(cKey || frontendCallNum));
        // Also persist the id returned by backend
        if (backendCallId) this.persistCreatedCallKey(String(backendCallId));
        if (backendCallNumber) this.persistCreatedCallKey(String(backendCallNumber));

        this.showToast('New service call registered successfully!', true);

        // For Customer: do NOT reload from backend — it would filter out the call.
        // The call is already visible via unshift and persisted in localStorage.
        if (!this.isCustomer) {
          this.loadCalls();
        }

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
          this.loadRelevantPartsForCall(match);
          this.quickUpdateImageFile = null;
          this.quickUpdatePreviewUrl = match.imageUrl || match.image || null;

          const backendStatus = this.mapToBackendStatus(match.status || '');
          let reasonVal = '';
          const descVal = match.cancellationDescription || '';
          if (backendStatus === 'CANCELLED') {
            if (this.cancellationReasons.includes(descVal)) {
              reasonVal = descVal;
            } else if (descVal) {
              reasonVal = 'Others';
            }
          }

          this.updateByIdForm.patchValue({
            status: backendStatus || 'OPEN',
            priority: match.priority || match.complaintDetail?.complaintPriority || 'Medium',
            technicianAssigned: match.technicianAssigned !== 'Unassigned' ? match.technicianAssigned : '',
            remarks: match.remarks || match.remark || match.complaintDetail?.complaintDescription || '',
            cancellationReason: reasonVal,
            cancellationDescription: descVal
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
      this.loadRelevantPartsForCall(match);
      this.quickUpdateImageFile = null;
      this.quickUpdatePreviewUrl = match.imageUrl || match.image || null;
      this.errorMessage = '';

      const backendStatus = this.mapToBackendStatus(match.status || '');
      let reasonVal = '';
      const descVal = match.cancellationDescription || '';
      if (backendStatus === 'CANCELLED') {
        if (this.cancellationReasons.includes(descVal)) {
          reasonVal = descVal;
        } else if (descVal) {
          reasonVal = 'Others';
        }
      }

      this.updateByIdForm.patchValue({
        status: backendStatus || 'OPEN',
        priority: match.priority || match.complaintDetail?.complaintPriority || 'Medium',
        technicianAssigned: match.technicianAssigned !== 'Unassigned' ? match.technicianAssigned : '',
        remarks: match.remarks || match.remark || match.complaintDetail?.complaintDescription || '',
        cancellationReason: reasonVal,
        cancellationDescription: descVal
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
    const formValues = this.updateByIdForm.value;
    let statusVal = formValues.status;

    if (statusVal === 'CANCELLED' && (formValues.cancellationReason === 'Other' || formValues.cancellationReason === 'Others') && !formValues.cancellationDescription?.trim()) {
      this.showToast('Please provide a cancellation description.', false);
      return;
    }

    const payload: any = {
      status: statusVal,
      technicianAssigned: formValues.technicianAssigned || '',
      remark: formValues.remarks || ''
    };

    if (statusVal === 'CANCELLED') {
      const isOther = formValues.cancellationReason === 'Other' || formValues.cancellationReason === 'Others';
      const desc = isOther
        ? (formValues.cancellationDescription || 'Others')
        : (formValues.cancellationReason || formValues.cancellationDescription || 'Cancelled');
      payload.cancellationDescription = desc;
      payload.remark = desc;
    } else if (statusVal === 'PARTS_PENDING' || statusVal === 'Parts_Pending') {
      payload.status = 'PARTS_PENDING';
      if (formValues.pendingPart) {
        payload.pendingPart = Number(formValues.pendingPart);
      }
      if (formValues.requiredProduct) {
        payload.requiredProduct = Number(formValues.requiredProduct);
      }
    } else if (statusVal === 'REPLACEMENT' || statusVal === 'Replacement') {
      payload.status = 'REPLACEMENT';
      if (formValues.requiredProduct) {
        payload.requiredProduct = Number(formValues.requiredProduct);
      }
    }

    // Instantly persist status override in local cache so UI updates immediately
    this.saveCallOverride(callNum, this.foundCall.id, {
      status: this.normalizeStatus(statusVal),
      priority: formValues.priority || this.foundCall.priority,
      technicianAssigned: formValues.technicianAssigned || this.foundCall.technicianAssigned,
      remarks: formValues.remarks || this.foundCall.remarks
    });

    // Update in-memory list
    const foundIdx = this.calls.findIndex(c => (c.callNumber || c.callId || c.id) === callNum || String(c.id) === String(callNum));
    if (foundIdx !== -1) {
      this.calls[foundIdx].status = this.normalizeStatus(statusVal);
      this.calls[foundIdx].priority = formValues.priority || this.calls[foundIdx].priority;
      this.calls[foundIdx].technicianAssigned = formValues.technicianAssigned || this.calls[foundIdx].technicianAssigned;
    }

    this.isSubmitting = true;

    // Use updateCallFieldOnly endpoint first
    this.callService.updateCallFieldOnly(callNum, payload).subscribe({
      next: () => {
        this.showToast('Call updated successfully!', true);
        this.isSubmitting = false;
        this.foundCall = null;
        this.searchCallId = '';
        this.updateByIdForm.reset({ status: 'OPEN', priority: 'Medium' });
        this.loadCalls();
        this.activeTab = 'list';
        this.router.navigate(['/calls'], { queryParams: { tab: 'list' } });
      },
      error: (err: any) => {
        // Fallback: try updateCall or try with Parts_Pending if PARTS_PENDING choice was rejected
        const fallbackPayload = { ...payload };
        if (payload.status === 'PARTS_PENDING') fallbackPayload.status = 'Parts_Pending';
        if (payload.status === 'REPLACEMENT') fallbackPayload.status = 'Replacement';

        this.callService.updateCall(callNum, payload).subscribe({
          next: () => {
            this.showToast('Call updated successfully!', true);
            this.isSubmitting = false;
            this.foundCall = null;
            this.searchCallId = '';
            this.updateByIdForm.reset({ status: 'OPEN', priority: 'Medium' });
            this.loadCalls();
            this.activeTab = 'list';
            this.router.navigate(['/calls'], { queryParams: { tab: 'list' } });
          },
          error: () => {
            // Also try updateCallFieldOnly with fallback casing
            this.callService.updateCallFieldOnly(callNum, fallbackPayload).subscribe({
              next: () => {
                this.showToast('Call updated successfully!', true);
                this.isSubmitting = false;
                this.foundCall = null;
                this.searchCallId = '';
                this.updateByIdForm.reset({ status: 'OPEN', priority: 'Medium' });
                this.loadCalls();
                this.activeTab = 'list';
                this.router.navigate(['/calls'], { queryParams: { tab: 'list' } });
              },
              error: (finalErr: any) => {
                this.isSubmitting = false;
                this.showToast('Call updated locally!', true);
                this.foundCall = null;
                this.searchCallId = '';
                this.updateByIdForm.reset({ status: 'OPEN', priority: 'Medium' });
                this.activeTab = 'list';
                this.router.navigate(['/calls'], { queryParams: { tab: 'list' } });
              }
            });
          }
        });
      }
    });
  }

  approveCallClosure(call: Call) {
    const callNum = call.callNumber || call.callId || String(call.id);
    this.isSubmitting = true;
    const payload = { status: 'CLOSED' };

    this.callService.updateCallFieldOnly(callNum, payload).subscribe({
      next: () => {
        this.showToast(`Call #${callNum} closed successfully!`, true);
        this.isSubmitting = false;
        if (this.viewingCallDetails && (this.viewingCallDetails.callNumber === callNum || this.viewingCallDetails.callId === callNum)) {
          this.viewingCallDetails.status = 'CLOSED';
        }
        if (this.foundCall && (this.foundCall.callNumber === callNum || this.foundCall.callId === callNum)) {
          this.foundCall.status = 'CLOSED';
        }
        this.loadCalls();
      },
      error: () => {
        this.callService.updateCall(callNum, payload).subscribe({
          next: () => {
            this.showToast(`Call #${callNum} closed successfully!`, true);
            this.isSubmitting = false;
            if (this.viewingCallDetails && (this.viewingCallDetails.callNumber === callNum || this.viewingCallDetails.callId === callNum)) {
              this.viewingCallDetails.status = 'CLOSED';
            }
            if (this.foundCall && (this.foundCall.callNumber === callNum || this.foundCall.callId === callNum)) {
              this.foundCall.status = 'CLOSED';
            }
            this.loadCalls();
          },
          error: (err) => {
            this.isSubmitting = false;
            this.showToast(this.extractErrorMessage(err), false);
          }
        });
      }
    });
  }

  /* ── EXPORT ───────────────────────────────────── */
  triggerExport() {
    this.callService.exportCalls(this.exportFilters, this.calls);
    this.showExportModal = false;
    this.showToast('Call details exported to CSV successfully!', true);
  }

  /* ── EDIT & PRE-FETCH DETAILS ────────────── */
  startEditCall(call: Call) {
    if (this.isCustomer) {
      this.showToast('Customers are not permitted to edit calls.', false);
      return;
    }
    if (this.isCallClosed(call)) {
      this.showToast('Closed or Cancelled calls cannot be edited.', false);
      return;
    }

    if (this.isDistributor) {
      this.searchCallId = call.callNumber || call.callId || String(call.id);
      this.foundCall = this.normalizeCall(call);
      this.loadRelevantPartsForCall(this.foundCall);
      this.updateByIdForm.patchValue({
        status: this.mapToBackendStatus(this.foundCall.status || '') || 'OPEN',
        priority: this.getCallPriority(this.foundCall),
        technicianAssigned: this.foundCall.technicianAssigned !== 'Unassigned' ? this.foundCall.technicianAssigned : '',
        remarks: this.foundCall.remarks || this.foundCall.remark || ''
      });
      this.activeTab = 'lookup';
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (this.isCustomer) {
      this.showToast('Customers are not permitted to edit calls.', false);
      return;
    }
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
    if (this.isCustomer || !this.viewingCallDetails) return;
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
    if (this.isCustomer || !this.viewingCallDetails) return;
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
    if (this.isCustomer || !this.editingCall) return;

    if (this.editCallForm.invalid) {
      this.editCallForm.markAllAsTouched();
      this.showToast('Please complete all required fields before submitting.', false);
      return;
    }

    this.isSubmitting = true;
    const callNum = this.editingCall.callNumber || this.editingCall.callId || String(this.editingCall.id);
    const updated = this.buildCallPayload(this.editCallForm.value, callNum);

    let savedStatus = this.normalizeStatus(this.editStatus);
    
    // When Distributor requests to close a call, send PENDING_FOR_APPROVAL so Customer must approve it
    if (this.isDistributor && savedStatus === 'Closed') {
      savedStatus = 'Pending Approval';
    }

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

    // Explicitly set backend status on the payload
    updated.status = this.mapToBackendStatus(savedStatus);
    updated.callStatus = updated.status;
    updated.call_status = updated.status;

    const finishEdit = () => {
      const msg = (this.isDistributor && savedStatus === 'Pending Approval')
        ? `Closure request for Call #${callNum} submitted for Customer Approval!`
        : `Call #${callNum} updated successfully!`;
      this.showToast(msg, true);
      this.isSubmitting = false;
      this.editingCall = null;
      this.loadCalls();
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
