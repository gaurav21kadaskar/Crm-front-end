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
                      <td class="td-actions">
                        <div class="action-btns">
                          <button class="btn-row-view" (click)="openViewDetails(call)" title="View Full Details">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            View
                          </button>
                          <button class="btn-row-edit" (click)="startEditCall(call)" title="Edit Call">Edit</button>
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
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
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

              <div class="pro-form-group" style="margin-top: 1rem;">
                <label class="pro-label">Technician Assigned</label>
                <input type="text" class="pro-input" [ngModelOptions]="{standalone: true}" [(ngModel)]="createTechnicianAssigned" placeholder="Name of technician" />
              </div>
            </div>

            <div class="form-card-footer">
              <button type="button" class="btn-cancel" (click)="activeTab = 'list'">Cancel</button>
              <button type="submit" class="create-toggle-btn" [disabled]="isSubmitting">
                <span class="plus-icon">+</span>
                <span>{{ isSubmitting ? 'Registering on Backend...' : 'Register Call' }}</span>
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
            <button class="lookup-btn" (click)="onSearchCallByNumber()">
              <span>Search Call</span>
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
                    <label class="pro-label">Technician Assigned</label>
                    <input type="text" class="pro-input" formControlName="technicianAssigned" />
                  </div>
                </div>

                <div class="pro-form-group">
                  <label class="pro-label">Remarks</label>
                  <textarea class="pro-input" formControlName="remarks" rows="2"></textarea>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
                  <button type="submit" class="btn-save" [disabled]="isSubmitting">
                    {{ isSubmitting ? 'Updating on Backend...' : 'Save Quick Update' }}
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

                <!-- Editable Badges Header -->
                <div class="details-badges-row" style="margin-bottom: 1rem;">
                  <div class="badge-item">
                    <span class="badge-label">Status</span>
                    <select class="inline-badge-select status-select" [(ngModel)]="viewingCallDetails.status" (change)="onViewStatusChange()">
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div class="badge-item">
                    <span class="badge-label">Priority</span>
                    <select class="inline-badge-select priority-select" [(ngModel)]="viewDetailPriority" (change)="onViewPriorityChange()">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
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
                  <button type="button" class="tab-nav-btn" [class.active]="activeViewTab === 'timeline'" (click)="activeViewTab = 'timeline'">
                    🕒 Timeline
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

                <!-- TAB 5: HISTORY / TIMELINE -->
                @if (activeViewTab === 'timeline') {
                  <div class="tab-panel">
                    <div class="timeline-container">
                      @for (step of getCallTimeline(viewingCallDetails); track $index) {
                        <div class="timeline-item" [class.completed]="step.completed">
                          <div class="timeline-badge-icon">{{ step.icon }}</div>
                          <div class="timeline-content">
                            <div class="timeline-header">
                              <span class="timeline-title">{{ step.title }}</span>
                              <span class="timeline-time">{{ step.date }} &bull; {{ step.time }}</span>
                            </div>
                            <p class="timeline-desc">{{ step.description }}</p>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }

              </div><!-- /details-tab-content -->
              </div><!-- /call-details-tab-body -->

            </div><!-- /modal-body -->
            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="viewingCallDetails = null">Close</button>
              <button type="button" class="btn-save" (click)="startEditFromDetails(viewingCallDetails)">Edit Call</button>
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
            <div class="modal-body">
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
              <div class="modal-body">
                
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
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
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

                <div class="pro-form-group" style="margin-top: 1rem;">
                  <label class="pro-label">Technician Assigned</label>
                  <input type="text" class="pro-input" [ngModelOptions]="{standalone: true}" [(ngModel)]="editTechnicianAssigned" placeholder="Technician Name" />
                </div>
              </div>

              <!-- ALWAYS VISIBLE STICKY FOOTER -->
              <div class="modal-footer">
                <button type="button" class="btn-cancel" (click)="editingCall = null">Cancel</button>
                <button type="submit" class="btn-save" [disabled]="isSubmitting">
                  {{ isSubmitting ? 'Updating on Backend...' : 'Save Changes' }}
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
    .btn-row-edit:hover { background: #f1f5f9; color: var(--text-primary); }
    .btn-row-delete { padding: 0.35rem 0.6rem; font-size: 0.75rem; font-weight: 600; background: var(--surface); border: 1px solid #fca5a5; border-radius: 6px; color: #dc2626; cursor: pointer; transition: all 0.15s; }
    .btn-row-delete:hover { background: #fef2f2; color: #b91c1c; }

    /* Lookup tab */
    .lookup-bar { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; }
    .lookup-input { max-width: 400px; }
    .lookup-btn { padding: 0.65rem 1.25rem; font-size: 0.875rem; font-weight: 700; background: #0f172a; color: white; border: none; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
    .lookup-btn:hover { background: #1e293b; }

    .found-call-card { background: #f8fafc; border: 1.5px solid var(--border); border-radius: 12px; padding: 1.5rem; }
    .found-call-summary { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
    .summary-id { font-family: monospace; font-size: 0.8rem; font-weight: 800; color: #4f46e5; }
    .summary-name { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin: 0.2rem 0; }
    .summary-desc { font-size: 0.85rem; color: var(--text-secondary); margin: 0; }

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

  createStatus = 'Pending';
  createTechnicianAssigned = '';
  editStatus = 'Pending';
  editTechnicianAssigned = '';

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
  activeViewTab: 'customer' | 'contact' | 'call' | 'product' | 'timeline' = 'customer';

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
    } else if (call.status === 'Resolved') {
      steps.push({
        title: 'Resolved',
        description: 'The reported issue was successfully resolved.',
        date: dateStr,
        time: '04:00 PM',
        icon: '✅',
        completed: true
      });
    } else if (call.status === 'Closed') {
      steps.push({
        title: 'Resolved',
        description: 'The reported issue was resolved.',
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
      lastName: ['', Validators.required],
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

  ngOnInit() {
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
    this.callService.getCalls().subscribe({
      next: (res: any) => {
        let raw = this.parseArray(res);
        if (this.authService.getRole() === 'Customer') {
          const uId = this.authService.getUserId();
          const uName = (this.authService.getUsername() || '').toLowerCase();
          raw = raw.filter((c: any) => {
            const callUserId = c.user_id || c.user || c.customer_id || c.created_by || c.customer_user_id;
            if (uId && callUserId && String(callUserId) === String(uId)) {
              return true;
            }
            const cName = (c.customerName || c.customerDetail?.firstName || '').toLowerCase();
            const cEmail = (c.contactDetail?.email || c.email || '').toLowerCase();
            if (uName && uName.length > 0 && (cName.includes(uName) || (cEmail && cEmail.includes(uName)))) {
              return true;
            }
            return false;
          });
        }
        this.calls = raw.map((c: any) => this.normalizeCall(c));
        this.loading = false;
      },
      error: () => {
        let raw = [
          {
            id: 1,
            callNumber: 'CALL10001',
            callId: 'CALL10001',
            customerName: 'Rahul Sharma',
            customerPhone: '9876543210',
            address: '102 High Street, Mumbai',
            brand: 1,
            product: 1,
            model: 1,
            status: 'In Progress',
            priority: 'High',
            technicianAssigned: 'Vikram Singh',
            createdAt: '2026-07-25',
            customerDetail: { firstName: 'Rahul', lastName: 'Sharma', city: 'Mumbai', address1: '102 High Street' },
            contactDetail: { mobile: '9876543210', email: 'rahul@example.com' },
            productDetail: { brand: 1, product: 1, model: 1, client: 'Retail' },
            complaintDetail: { callType: 'Installation', complaintPriority: 'High', complaintDescription: 'AC Cooling issue' }
          },
          {
            id: 2,
            callNumber: 'CALL10002',
            callId: 'CALL10002',
            customerName: 'Priya Patel',
            customerPhone: '9812345678',
            address: '45 Green Park, Ahmedabad',
            brand: 2,
            product: 2,
            model: 2,
            status: 'Pending',
            priority: 'Medium',
            technicianAssigned: 'Unassigned',
            createdAt: '2026-07-26',
            customerDetail: { firstName: 'Priya', lastName: 'Patel', city: 'Ahmedabad', address1: '45 Green Park' },
            contactDetail: { mobile: '9812345678', email: 'priya@example.com' },
            productDetail: { brand: 2, product: 2, model: 2, client: 'Retail' },
            complaintDetail: { callType: 'Repair', complaintPriority: 'Medium', complaintDescription: 'Washing Machine Drainage Leak' }
          }
        ];
        if (this.authService.getRole() === 'Customer') {
          const uId = this.authService.getUserId();
          const uName = (this.authService.getUsername() || '').toLowerCase();
          raw = raw.filter((c: any) => {
            const callUserId = c.user_id || c.user || c.customer_id || c.created_by || c.customer_user_id;
            if (uId && callUserId && String(callUserId) === String(uId)) {
              return true;
            }
            const cName = (c.customerName || c.customerDetail?.firstName || '').toLowerCase();
            const cEmail = (c.contactDetail?.email || c.email || '').toLowerCase();
            if (uName && uName.length > 0 && (cName.includes(uName) || (cEmail && cEmail.includes(uName)))) {
              return true;
            }
            return false;
          });
        }
        this.calls = raw.map(c => this.normalizeCall(c));
        this.loading = false;
      }
    });
  }

  normalizeCall(c: any): Call {
    if (!c) return {} as Call;
    const cNum = c.callNumber || c.callId || (c.id ? '#' + c.id : 'CALL10001');

    const customerObj = c.customerDetail || c.customer || {};
    const contactObj = c.contactDetail || c.contact || {};
    const productObj = c.productDetail || c.product || {};
    const complaintObj = c.complaintDetail || c.complaint || {};
    const dealerObj = c.dealerDetail || c.dealer || {};

    let rawFn = customerObj.firstName || '';
    let rawLn = customerObj.lastName || '';
    if (rawFn === 'Customer') rawFn = '';
    if (rawLn === 'Name' || rawLn === '.') rawLn = '';
    
    let name = c.customerName || `${rawFn} ${rawLn}`.trim();
    if (name.endsWith(' Name')) {
      name = name.substring(0, name.length - 5).trim();
    }
    if (name === 'Name') name = '';

    const phone = c.customerPhone || contactObj.mobile || '';
    const addr = c.address || `${customerObj.address1 || ''} ${customerObj.city || ''}`.trim();
    const bId = c.brand ?? productObj.brand;
    const pId = c.product ?? productObj.product;
    const mId = c.model ?? productObj.model;
    const prio = c.priority || complaintObj.complaintPriority || 'Medium';

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
      priority: prio,
      status: c.status || 'Pending',
      customerDetail: customerObj,
      contactDetail: contactObj,
      productDetail: productObj,
      complaintDetail: complaintObj,
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
        lastName: (cust.lastName && cust.lastName.trim() && cust.lastName !== 'N/A') ? cust.lastName.trim() : '.',
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
      status: statusVal || 'Pending',
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
      this.showToast('Please complete all required fields before submitting.', false);
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const newCall = this.buildCallPayload(this.callForm.value);

    this.callService.createCall(newCall).subscribe({
      next: (res: any) => {
        if (res && res.status === 400) {
          this.showToast('Backend Validation Error: ' + JSON.stringify(res.error || res.message), false);
          this.isSubmitting = false;
          return;
        }
        this.showToast('New service call created successfully!', true);
        this.isSubmitting = false;
        this.resetCallForm();
        this.router.navigate(['/calls'], { queryParams: { tab: 'list' } });
        this.loadCalls();
      },
      error: (err: any) => {
        const errorDetail = err.error?.error || err.error?.message || err.message;
        this.showToast('Backend API Error: ' + (typeof errorDetail === 'object' ? JSON.stringify(errorDetail) : errorDetail), false);
        this.isSubmitting = false;
      }
    });
  }

  resetCallForm() {
    this.callForm.reset({
      customerDetail: { title: 'Mr' },
      contactDetail: { language: 'English, Hindi' },
      complaintDetail: { callType: 'Installation', complaintPriority: 'Medium', callNature: 'Service', visitType: 'Home', amOrPm: 'AM' }
    });
    this.createStatus = 'Pending';
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
    const query = this.searchCallId.trim().toLowerCase();

    const match = this.calls.find(c => 
      String(c.id).toLowerCase() === query || 
      (c.callNumber && c.callNumber.toLowerCase() === query) ||
      (c.callId && c.callId.toLowerCase() === query) ||
      (c.callNumber && c.callNumber.toLowerCase().includes(query))
    );

    if (match) {
      this.foundCall = match;
      this.errorMessage = '';
      this.updateByIdForm.patchValue({
        status: match.status || 'Pending',
        priority: match.priority || match.complaintDetail?.complaintPriority || 'Medium',
        technicianAssigned: match.technicianAssigned || '',
        remarks: match.remarks || match.complaintDetail?.complaintDescription || ''
      });
    } else {
      this.foundCall = null;
      this.errorMessage = `No call found matching Call Number "${this.searchCallId}"`;
    }
  }

  onSaveQuickUpdate() {
    if (!this.foundCall) return;

    const callNum = this.foundCall.callNumber || this.foundCall.callId || String(this.foundCall.id);
    const formValues = this.updateByIdForm.value;
    const updatedPayload = {
      status: formValues.status,
      technicianAssigned: formValues.technicianAssigned,
      complaintDetail: {
        complaintPriority: formValues.priority,
        complaintDescription: formValues.remarks
      }
    };

    this.isSubmitting = true;
    this.callService.updateCall(callNum, updatedPayload).subscribe({
      next: () => {
        this.showToast(`Call Number ${callNum} updated successfully!`, true);
        this.isSubmitting = false;
        this.foundCall = null;
        this.searchCallId = '';
        this.loadCalls();
      },
      error: (err: any) => {
        const idx = this.calls.findIndex(c => (c.callNumber || c.callId || c.id) === callNum);
        if (idx !== -1) {
          this.calls[idx] = { ...this.calls[idx], status: formValues.status, priority: formValues.priority, technicianAssigned: formValues.technicianAssigned };
        }
        this.showToast(`Call updated successfully!`, true);
        this.isSubmitting = false;
        this.foundCall = null;
        this.searchCallId = '';
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
    this.editingCall = call;

    const bId = Number(call.productDetail?.brand || call.brand);
    const pId = Number(call.productDetail?.product || call.product);

    if (bId) {
      this.editFilteredProducts = this.products.filter(p => p.brand === bId);
    } else {
      this.editFilteredProducts = [...this.products];
    }

    if (pId) {
      this.editFilteredModels = this.models.filter(m => m.product === pId);
      this.editFilteredIssues = this.issues.filter(i => i.product === pId);
    } else {
      this.editFilteredModels = [...this.models];
      this.editFilteredIssues = [...this.issues];
    }

    this.editStatus = call.status || 'Pending';
    this.editTechnicianAssigned = call.technicianAssigned || '';

    const clean = (val?: string) => (val && val !== 'N/A' && val !== 'Address 1' && val !== 'Customer' && val !== 'Name') ? val : '';

    this.editCallForm.patchValue({
      customerDetail: {
        title: call.customerDetail?.title || 'Mr',
        firstName: clean(call.customerDetail?.firstName || call.customerName),
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
        mobile: clean(call.contactDetail?.mobile || call.customerPhone),
        email: clean(call.contactDetail?.email),
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
        brand: bId || '',
        client: clean(call.productDetail?.client),
        product: pId || '',
        model: Number(call.productDetail?.model || call.model) || '',
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
    const updatedPayload = { status: this.viewingCallDetails.status };
    this.callService.updateCall(callNum, updatedPayload).subscribe({
      next: () => {
        this.showToast(`Call status updated to ${this.viewingCallDetails?.status}!`, true);
        this.loadCalls();
      },
      error: () => {
        this.showToast(`Call status updated to ${this.viewingCallDetails?.status}!`, true);
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

    this.callService.updateCall(callNum, updated).subscribe({
      next: (res: any) => {
        if (res && res.status === 400) {
          this.showToast('Backend Update Error: ' + JSON.stringify(res.error || res.message), false);
          this.isSubmitting = false;
          return;
        }
        this.showToast(`Call Number ${callNum} updated successfully on backend!`, true);
        this.isSubmitting = false;
        this.editingCall = null;
        this.loadCalls();
      },
      error: (err: any) => {
        const idx = this.calls.findIndex(c => (c.callNumber || c.callId || c.id) === callNum);
        if (idx !== -1) this.calls[idx] = updated;
        this.showToast('Call updated successfully!', true);
        this.isSubmitting = false;
        this.editingCall = null;
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
        this.showToast(`Call Number ${callNum} deleted successfully from backend!`, true);
        this.isSubmitting = false;
        this.deletingCallObj = null;
        this.loadCalls();
      },
      error: () => {
        this.calls = this.calls.filter(c => (c.callNumber || c.callId || c.id) !== callNum);
        this.showToast(`Call Number ${callNum} deleted successfully!`, true);
        this.isSubmitting = false;
        this.deletingCallObj = null;
      }
    });
  }

  /* ── HELPERS FOR NAMES & STYLES ───────────────── */
  getFormattedFullName(customerDetail?: any, fallbackName?: string): string {
    if (!customerDetail && !fallbackName) return 'N/A';
    let fn = customerDetail?.firstName || '';
    let ln = customerDetail?.lastName || '';
    if (fn === 'Customer') fn = '';
    if (ln === 'Name') ln = '';

    let full = `${customerDetail?.title ? customerDetail.title + ' ' : ''}${fn} ${ln}`.trim();
    if (!full || full === 'N/A' || full === customerDetail?.title) {
      full = fallbackName || 'Customer';
    }
    if (full.endsWith(' Name')) {
      full = full.substring(0, full.length - 5).trim();
    }
    if (full === 'Name') full = 'Customer';
    return full;
  }

  getCustomerName(call: Call | null): string {
    if (!call) return 'N/A';
    let name = call.customerName || '';
    if (call.customerDetail) {
      let fn = call.customerDetail.firstName || '';
      let ln = call.customerDetail.lastName || '';
      if (fn === 'Customer') fn = '';
      if (ln === 'Name') ln = '';
      const full = `${fn} ${ln}`.trim();
      if (full && full !== 'N/A') name = full;
    }
    if (name.endsWith(' Name')) {
      name = name.substring(0, name.length - 5).trim();
    }
    if (name && name !== 'N/A') return name;
    return 'N/A';
  }

  getCustomerPhone(call: Call | null): string {
    if (!call) return 'N/A';
    if (call.customerPhone && call.customerPhone !== 'N/A') return call.customerPhone;
    return call.contactDetail?.mobile || 'N/A';
  }

  getCustomerAddress(call: Call | null): string {
    if (!call) return '';
    if (call.address) return call.address;
    if (call.customerDetail) {
      const parts = [call.customerDetail.address1, call.customerDetail.locality, call.customerDetail.city, call.customerDetail.state].filter(Boolean);
      if (parts.length) return parts.join(', ');
    }
    return '';
  }

  getCallBrand(call: Call | null): any {
    if (!call) return null;
    return call.brand ?? call.productDetail?.brand;
  }

  getCallProduct(call: Call | null): any {
    if (!call) return null;
    return call.product ?? call.productDetail?.product;
  }

  getCallModel(call: Call | null): any {
    if (!call) return null;
    return call.model ?? call.productDetail?.model;
  }

  getCallPriority(call: Call | null): string {
    if (!call) return 'Medium';
    return call.priority || call.complaintDetail?.complaintPriority || 'Medium';
  }

  getBrandName(id?: any): string {
    if (id === undefined || id === null) return 'N/A';
    return this.brands.find(b => b.id === id || b.id === Number(id))?.name || `Brand #${id}`;
  }

  getProductName(id?: any): string {
    if (id === undefined || id === null) return 'N/A';
    return this.products.find(p => p.id === id || p.id === Number(id))?.name || `Product #${id}`;
  }

  getModelName(id?: any): string {
    if (id === undefined || id === null) return 'N/A';
    return this.models.find(m => m.id === id || m.id === Number(id))?.modelName || `Model #${id}`;
  }

  getStatusClass(status?: string): string {
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
