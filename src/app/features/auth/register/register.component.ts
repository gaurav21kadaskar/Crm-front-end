import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { BrandService } from '../../../core/services/brand.service';
import { Brand } from '../../../core/models/brand.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  template: `
    <div class="page-container animate-fade-in">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">User Management</h1>
          <p class="page-subtitle">View existing registered users and create new accounts</p>
        </div>
        <div class="header-action-area">
          <div class="header-tab-pill">
            <button 
              type="button" 
              class="tab-pill-btn" 
              [class.active]="activeTab === 'list'" 
              (click)="activeTab = 'list'; loadUsers()"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>User Directory</span>
              <span class="count-pill">{{ users.length }}</span>
            </button>
          </div>

          <button 
            type="button" 
            class="create-user-cta-btn" 
            [class.btn-back-mode]="activeTab === 'create'"
            (click)="activeTab = (activeTab === 'create' ? 'list' : 'create')"
          >
            @if (activeTab === 'create') {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              <span>Back to Users List</span>
            } @else {
              <div class="plus-circle">+</div>
              <span>Create New User</span>
            }
          </button>
        </div>
      </div>

      <!-- TAB 1: USER LIST -->
      @if (activeTab === 'list') {
        <div class="data-card animate-fade-in">
          <!-- CARD HEADER WITH FILTERS -->
          <div class="data-card-header">
            <div class="header-left">
              <div class="search-box">
                <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input 
                  type="text" 
                  class="search-input" 
                  placeholder="Search by username, name, email, or role..." 
                  [(ngModel)]="searchQuery"
                  (input)="filterUsers()"
                />
              </div>
              <div class="status-filter">
                <select class="filter-select" [(ngModel)]="selectedStatus" (change)="loadUsers()">
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>
              </div>
            </div>
            <div class="header-actions">
              <button class="refresh-btn" (click)="loadUsers()" [disabled]="isLoadingList">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                {{ isLoadingList ? 'Loading...' : 'Refresh' }}
              </button>
            </div>
          </div>

          <!-- TABLE -->
          <div class="table-responsive">
            <table class="pro-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>FULL NAME</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>BRAND</th>
                  <th>PINCODE RANGE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                @if (isLoadingList) {
                  <tr>
                    <td colspan="7" class="loading-td">
                      <div class="spinner"></div>
                      <span>Fetching registered users...</span>
                    </td>
                  </tr>
                } @else if (filteredUsers.length === 0) {
                  <tr>
                    <td colspan="7" class="empty-td">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <p>No users found matching your filters.</p>
                    </td>
                  </tr>
                } @else {
                  @for (u of filteredUsers; track u.id || u.username) {
                    <tr>
                      <td>
                        <div class="user-avatar-cell">
                          <div class="user-avatar" [ngClass]="getRoleClass(u)">
                            {{ (u.username || 'U').charAt(0).toUpperCase() }}
                          </div>
                          <div>
                            <span class="user-username">{{ u.username }}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="user-fullname">{{ getFullName(u) }}</span>
                      </td>
                      <td>
                        <span class="user-email">{{ u.email || '—' }}</span>
                      </td>
                      <td>
                        <span class="role-badge" [ngClass]="getRoleClass(u)">
                          {{ getUserRole(u) }}
                        </span>
                      </td>
                      <td>
                        @let bList = getUserBrandList(u);
                        @if (bList.length === 0) {
                          <span style="color: #94a3b8; font-size: 0.8rem;">—</span>
                        } @else if (bList.length <= 2) {
                          <div class="brand-badges-container">
                            @for (bName of bList; track bName) {
                              <span class="brand-chip">{{ bName }}</span>
                            }
                          </div>
                        } @else {
                          <div class="brand-badges-container">
                            <span class="brand-chip">{{ bList[0] }}</span>
                            <span class="brand-chip">{{ bList[1] }}</span>
                            <span class="brand-chip count-chip" [title]="'Other brands: ' + bList.slice(2).join(', ')">
                              +{{ bList.length - 2 }} more
                            </span>
                          </div>
                        }
                      </td>
                      <td>
                        @if (u.fromPin && u.toPin) {
                          <span class="pin-badge">{{ u.fromPin }} &ndash; {{ u.toPin }}</span>
                        } @else {
                          <span style="color: #94a3b8; font-size: 0.8rem;">All</span>
                        }
                      </td>
                      <td>
                        <button 
                          type="button" 
                          class="toggle-switch-btn" 
                          [class.active]="u.isActive !== false" 
                          (click)="promptUserStatusChange(u)"
                          [disabled]="togglingUsername === u.username"
                          [title]="'Click to toggle status to ' + (u.isActive !== false ? 'Inactive' : 'Active')"
                        >
                          <span class="toggle-track">
                            <span class="toggle-thumb"></span>
                          </span>
                          <span class="toggle-text">{{ u.isActive !== false ? 'Active' : 'Inactive' }}</span>
                        </button>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Confirmation Popup for User Status Change -->
        @if (pendingStatusUser) {
          <div class="modal-backdrop animate-fade-in" (click)="cancelUserStatusChange()">
            <div class="modal-content confirm-card animate-slide-up" (click)="$event.stopPropagation()">
              <div class="modal-header confirm-header">
                <div class="confirm-icon-box" [style.background]="pendingStatusTarget ? '#dcfce7' : '#fee2e2'">
                  {{ pendingStatusTarget ? '🟢' : '⚠️' }}
                </div>
                <div>
                  <h3 class="modal-title">{{ pendingStatusTarget ? 'Confirm User Activation' : 'Confirm User Deactivation' }}</h3>
                  <p class="modal-subtitle">User: <strong>{{ pendingStatusUser.username }}</strong> {{ getFullName(pendingStatusUser) !== '—' ? '(' + getFullName(pendingStatusUser) + ')' : '' }}</p>
                </div>
                <button class="modal-close" (click)="cancelUserStatusChange()">&times;</button>
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
                <button type="button" class="btn-cancel" (click)="cancelUserStatusChange()" [disabled]="isUpdatingUserStatus">
                  Cancel
                </button>
                <button type="button" class="btn-confirm" [class.btn-activate]="pendingStatusTarget" (click)="confirmUserStatusChange()" [disabled]="isUpdatingUserStatus">
                  {{ isUpdatingUserStatus ? 'Updating...' : 'Confirm' }}
                </button>
              </div>
            </div>
          </div>
        }
      }

      <!-- TAB 2: CREATE USER FORM -->
      @if (activeTab === 'create') {
        <div class="form-wrapper animate-fade-in">
          <div class="pro-auth-card">
            <div class="pro-card-header">
              <div class="header-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              </div>
              <div>
                <h2 class="pro-title">Create New User</h2>
                <p class="pro-subtitle">Register an Admin, Customer, or Distributor account</p>
              </div>
            </div>
            
            <div class="pro-card-body">
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                <div class="pro-form-group">
                  <label class="pro-label" for="username">Username *</label>
                  <input 
                    id="username" 
                    type="text" 
                    class="pro-input" 
                    [ngClass]="{'pro-invalid': submitted && f['username'].errors}"
                    formControlName="username" 
                    placeholder="Enter username"
                  />
                  @if (submitted && f['username'].errors?.['required']) {
                    <div class="pro-error">Username is required</div>
                  }
                </div>

                <div class="pro-form-row">
                  <div class="pro-form-group half-width">
                    <label class="pro-label" for="firstName">First Name</label>
                    <input 
                      id="firstName" 
                      type="text" 
                      class="pro-input" 
                      formControlName="firstName" 
                      placeholder="First name"
                    />
                  </div>
                  <div class="pro-form-group half-width">
                    <label class="pro-label" for="lastName">Last Name</label>
                    <input 
                      id="lastName" 
                      type="text" 
                      class="pro-input" 
                      formControlName="lastName" 
                      placeholder="Last name"
                    />
                  </div>
                </div>
                
                <div class="pro-form-group">
                  <label class="pro-label" for="email">Email Address</label>
                  <input 
                    id="email" 
                    type="email" 
                    class="pro-input" 
                    [ngClass]="{'pro-invalid': submitted && f['email'].errors}"
                    formControlName="email" 
                    placeholder="name@company.com"
                  />
                  @if (submitted && f['email'].errors?.['email']) {
                    <div class="pro-error">Enter a valid email address</div>
                  }
                </div>
                
                <div class="pro-form-group">
                  <label class="pro-label" for="password">Password *</label>
                  <input 
                    id="password" 
                    type="password" 
                    class="pro-input" 
                    [ngClass]="{'pro-invalid': submitted && f['password'].errors}"
                    formControlName="password" 
                    placeholder="Enter password"
                  />
                  @if (submitted && f['password'].errors?.['required']) {
                    <div class="pro-error">Password is required</div>
                  }
                </div>

                <div class="pro-form-row">
                  <div class="pro-form-group half-width">
                    <label class="pro-label" for="fromPin">From PIN *</label>
                    <input 
                      id="fromPin" 
                      type="number" 
                      class="pro-input" 
                      [ngClass]="{'pro-invalid': submitted && f['fromPin'].errors}"
                      formControlName="fromPin" 
                      placeholder="e.g. 452001"
                    />
                    @if (submitted && f['fromPin'].errors?.['required']) {
                      <div class="pro-error">From PIN is required</div>
                    }
                  </div>
                  <div class="pro-form-group half-width">
                    <label class="pro-label" for="toPin">To PIN *</label>
                    <input 
                      id="toPin" 
                      type="number" 
                      class="pro-input" 
                      [ngClass]="{'pro-invalid': submitted && f['toPin'].errors}"
                      formControlName="toPin" 
                      placeholder="e.g. 452009"
                    />
                    @if (submitted && f['toPin'].errors?.['required']) {
                      <div class="pro-error">To PIN is required</div>
                    }
                  </div>
                </div>

                <div class="pro-form-group">
                  <label class="pro-label">Select User Role *</label>
                  <div class="role-cards-grid">
                    <!-- Admin Card -->
                    <div 
                      class="role-card" 
                      [class.selected]="registerForm.get('role')?.value === 'Admin'"
                      (click)="registerForm.get('role')?.setValue('Admin')"
                    >
                      <div class="role-card-icon icon-admin">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                      </div>
                      <div class="role-card-info">
                        <div class="role-card-name">Admin</div>
                      </div>
                      <div class="role-check">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    </div>

                    <!-- Customer Card -->
                    <div 
                      class="role-card" 
                      [class.selected]="registerForm.get('role')?.value === 'Customer'"
                      (click)="registerForm.get('role')?.setValue('Customer')"
                    >
                      <div class="role-card-icon icon-customer">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                      <div class="role-card-info">
                        <div class="role-card-name">Customer</div>
                      </div>
                      <div class="role-check">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    </div>

                    <!-- Distributor Card -->
                    <div 
                      class="role-card" 
                      [class.selected]="registerForm.get('role')?.value === 'Distributor'"
                      (click)="registerForm.get('role')?.setValue('Distributor')"
                    >
                      <div class="role-card-icon icon-distributor">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                        </svg>
                      </div>
                      <div class="role-card-info">
                        <div class="role-card-name">Distributor</div>
                      </div>
                      <div class="role-check">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    </div>
                  </div>
                  @if (submitted && f['role'].errors?.['required']) {
                    <div class="pro-error" style="margin-top: 0.5rem;">Please select a role.</div>
                  }
                </div>
                
                @if (registerForm.get('role')?.value === 'Customer') {
                  <div class="pro-form-group animate-fade-in">
                    <label class="pro-label" for="brand">Brand *</label>
                    <select 
                      id="brand" 
                      class="pro-input" 
                      [ngClass]="{'pro-invalid': submitted && f['brand'].errors}"
                      formControlName="brand"
                    >
                      <option value="" disabled selected>Select a brand</option>
                      @for (brand of brands; track brand.id) {
                        <option [value]="brand.id">{{ brand.name }}</option>
                      }
                    </select>
                    @if (submitted && f['brand'].errors?.['required']) {
                      <div class="pro-error">Brand is required for Customer</div>
                    }
                  </div>
                }
                
                <button type="submit" class="pro-btn-primary" [disabled]="isLoading">
                  {{ isLoading ? 'Creating User...' : 'Create Account' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-title {
      font-size: 1.6rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0.25rem 0 0;
    }

    .header-action-area {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .header-tab-pill {
      background: #f1f5f9;
      padding: 0.25rem;
      border-radius: 12px;
      display: flex;
    }

    .tab-pill-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 1rem;
      font-size: 0.86rem;
      font-weight: 600;
      color: #475569;
      background: transparent;
      border: none;
      border-radius: 9px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .tab-pill-btn.active {
      background: #ffffff;
      color: #4f46e5;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    }

    .count-pill {
      background: #e0e7ff;
      color: #4338ca;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.1rem 0.45rem;
      border-radius: 20px;
    }

    .create-user-cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.6rem 1.25rem;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #ffffff;
      border: none;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.35);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
    }

    .create-user-cta-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px 0 rgba(79, 70, 229, 0.45);
    }

    .create-user-cta-btn.btn-back-mode {
      background: #ffffff;
      color: #475569;
      border: 1.5px solid #cbd5e1;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .create-user-cta-btn.btn-back-mode:hover {
      background: #f8fafc;
      color: #0f172a;
      border-color: #94a3b8;
      transform: translateY(-1px);
    }

    .plus-circle {
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

    .data-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      overflow: hidden;
    }

    .data-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
      max-width: 600px;
    }

    .search-box {
      position: relative;
      flex: 1;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }

    .search-input {
      width: 100%;
      padding: 0.6rem 0.85rem 0.6rem 2.25rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
      outline: none;
      transition: all 0.2s;
    }

    .search-input:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    .filter-select {
      padding: 0.6rem 1rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      color: #334155;
      background: #ffffff;
      outline: none;
      cursor: pointer;
    }

    .refresh-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.6rem 1rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      background: #ffffff;
      color: #475569;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }

    .refresh-btn:hover:not(:disabled) {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .pro-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;
    }

    .pro-table th {
      padding: 0.85rem 1.25rem;
      background: #f8fafc;
      color: #64748b;
      font-weight: 600;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #e2e8f0;
    }

    .pro-table td {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
      vertical-align: middle;
    }

    .pro-table tr:last-child td {
      border-bottom: none;
    }

    .pro-table tr:hover td {
      background: #fcfcfd;
    }

    .user-avatar-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      color: white;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
    }

    .user-username {
      font-weight: 600;
      color: #0f172a;
    }

    .user-fullname {
      font-weight: 500;
      color: #334155;
    }

    .user-email {
      color: #64748b;
      font-size: 0.825rem;
    }

    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .role-admin { background: #ede9fe; color: #6d28d9; }
    .role-customer { background: #e0f2fe; color: #0369a1; }
    .role-distributor { background: #fef3c7; color: #b45309; }

    /* Role selection cards */
    .role-cards-grid {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      margin-top: 0.35rem;
    }

    .role-card {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      padding: 0.75rem 1rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      background: #ffffff;
      cursor: pointer;
      transition: all 0.18s ease;
      position: relative;
    }

    .role-card:hover {
      border-color: #cbd5e1;
      background: #f8fafc;
      transform: translateY(-1px);
    }

    .role-card.selected {
      border-color: #4f46e5;
      background: #f5f3ff;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.12);
    }

    .role-card-icon {
      width: 40px;
      height: 40px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-admin {
      background: #ede9fe;
      color: #7c3aed;
    }

    .icon-customer {
      background: #e0f2fe;
      color: #0284c7;
    }

    .icon-distributor {
      background: #fef3c7;
      color: #d97706;
    }

    .role-card-info {
      flex: 1;
    }

    .role-card-name {
      font-size: 0.88rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.2;
    }

    .role-card-desc {
      font-size: 0.76rem;
      color: #64748b;
      margin-top: 0.15rem;
    }

    .role-check {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 1.5px solid #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: transparent;
      transition: all 0.18s ease;
      flex-shrink: 0;
    }

    .role-card.selected .role-check {
      background: #4f46e5;
      border-color: #4f46e5;
      color: #ffffff;
    }

    .brand-cell {
      font-weight: 600;
      color: #475569;
    }

    .brand-badges-container {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.35rem;
      max-width: 260px;
    }

    .brand-chip {
      display: inline-flex;
      align-items: center;
      padding: 0.2rem 0.55rem;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      font-size: 0.76rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .brand-chip.count-chip {
      background: #f1f5f9;
      color: #475569;
      border-color: #cbd5e1;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .brand-chip.count-chip:hover {
      background: #e2e8f0;
      color: #0f172a;
      border-color: #94a3b8;
    }

    .pin-badge {
      font-family: monospace;
      font-size: 0.8rem;
      background: #f1f5f9;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      color: #334155;
    }

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
    .toggle-switch-btn:hover:not(:disabled) {
      transform: scale(1.03);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    .toggle-switch-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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

    .loading-td, .empty-td {
      text-align: center;
      padding: 3rem 1rem !important;
      color: #64748b;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid #e2e8f0;
      border-top-color: #4f46e5;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 0.75rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* CREATE FORM STYLES */
    .form-wrapper {
      display: flex;
      justify-content: center;
      padding-top: 1rem;
    }

    .pro-auth-card {
      width: 100%;
      max-width: 620px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 4px 20px -2px rgba(0,0,0,0.05);
      padding: 2.25rem;
    }

    .pro-card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.75rem;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 1.25rem;
    }

    .header-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
      flex-shrink: 0;
    }

    .pro-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .pro-subtitle {
      font-size: 0.825rem;
      color: #64748b;
      margin: 0.2rem 0 0 0;
    }

    .pro-form-group {
      margin-bottom: 1.15rem;
    }

    .pro-form-row {
      display: flex;
      gap: 1rem;
    }

    .half-width {
      flex: 1;
    }

    .pro-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.4rem;
    }

    .pro-input {
      width: 100%;
      padding: 0.65rem 0.85rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
      color: #0f172a;
      outline: none;
      transition: all 0.2s;
    }

    .pro-input:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    .pro-input.pro-invalid {
      border-color: #ef4444;
    }

    .pro-error {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .pro-btn-primary {
      width: 100%;
      padding: 0.75rem;
      background: #4f46e5;
      color: #ffffff;
      font-size: 0.9rem;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 1rem;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
    }

    .pro-btn-primary:hover:not(:disabled) {
      background: #4338ca;
    }

    /* Confirmation Modal Specifics */
    .modal-backdrop {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 99999;
      padding: 1rem; box-sizing: border-box;
    }
    .modal-content.confirm-card {
      background: #ffffff; border-radius: 14px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
      width: 100%; max-width: 440px; border: 1px solid #e2e8f0; overflow: hidden;
    }
    .confirm-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
    .confirm-icon-box {
      font-size: 1.5rem; width: 42px; height: 42px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .confirm-body { padding: 1.25rem 1.5rem; }
    .confirm-message { font-size: 0.95rem; color: #334155; line-height: 1.5; margin: 0; font-weight: 500; }
    .confirm-footer {
      padding: 1rem 1.5rem; background: #f8fafc; border-top: 1px solid #e2e8f0;
      display: flex; justify-content: flex-end; gap: 0.75rem;
    }
    .btn-confirm {
      padding: 0.55rem 1.25rem; font-size: 0.875rem; font-weight: 700; background: #dc2626;
      color: white; border: none; border-radius: 8px; cursor: pointer; transition: background 0.15s;
    }
    .btn-confirm:hover { background: #b91c1c; }
    .btn-confirm.btn-activate { background: #16a34a; }
    .btn-confirm.btn-activate:hover { background: #15803d; }
    .btn-cancel { padding: 0.55rem 1.2rem; font-size: 0.875rem; font-weight: 600; background: #64748b; color: white; border: none; border-radius: 8px; cursor: pointer; }
    .btn-cancel:hover { background: #475569; }

    .animate-fade-in {
      animation: fadeIn 0.25s ease-out both;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private brandService = inject(BrandService);
  private toast = inject(ToastService);

  activeTab: 'list' | 'create' = 'list';
  users: any[] = [];
  filteredUsers: any[] = [];
  isLoadingList = false;
  selectedStatus = 'All';
  searchQuery = '';

  registerForm: FormGroup;
  isLoading = false;
  submitted = false;
  brands: Brand[] = [];

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
      brand: [''],
      fromPin: [null, Validators.required],
      toPin: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.loadUsers();
    this.fetchBrands();

    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const brandControl = this.registerForm.get('brand');
      if (role === 'Customer') {
        brandControl?.setValidators([Validators.required]);
      } else {
        brandControl?.clearValidators();
        brandControl?.setValue('');
      }
      brandControl?.updateValueAndValidity();
    });
  }

  togglingUsername: string | null = null;
  pendingStatusUser: any | null = null;
  pendingStatusTarget: boolean | null = null;
  isUpdatingUserStatus = false;

  promptUserStatusChange(user: any) {
    this.pendingStatusUser = user;
    this.pendingStatusTarget = !(user.isActive !== false);
  }

  cancelUserStatusChange() {
    this.pendingStatusUser = null;
    this.pendingStatusTarget = null;
  }

  confirmUserStatusChange() {
    if (!this.pendingStatusUser || this.pendingStatusTarget === null) return;

    const u = this.pendingStatusUser;
    const targetStatus = Boolean(this.pendingStatusTarget);
    const currentActive = u.isActive !== false;
    this.isUpdatingUserStatus = true;
    this.togglingUsername = u.username;

    this.authService.updateUserStatus(u.username, targetStatus).subscribe({
      next: (res: any) => {
        this.isUpdatingUserStatus = false;
        this.togglingUsername = null;
        if (res.status === 200 || res.message === 'success') {
          u.isActive = targetStatus;
          this.toast.success('Status Updated', `User '${u.username}' status set to ${targetStatus ? 'Active' : 'Inactive'}.`);
        } else {
          u.isActive = currentActive;
          this.toast.error('Update Failed', res.message || 'Failed to update user status.');
        }
        this.pendingStatusUser = null;
        this.pendingStatusTarget = null;
      },
      error: (err: any) => {
        this.isUpdatingUserStatus = false;
        this.togglingUsername = null;
        u.isActive = currentActive;
        this.toast.error('Update Failed', err.message || 'Error updating user status.');
        this.pendingStatusUser = null;
        this.pendingStatusTarget = null;
      }
    });
  }

  loadUsers() {
    this.isLoadingList = true;
    this.authService.getUsers(this.selectedStatus).subscribe({
      next: (res: any) => {
        this.isLoadingList = false;
        const data = res?.data || (Array.isArray(res) ? res : []);
        this.users = data;
        this.filterUsers();
      },
      error: (err) => {
        this.isLoadingList = false;
        this.toast.error('Failed to load users', err.message || 'Error fetching user list');
      }
    });
  }

  filterUsers() {
    let result = [...this.users];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(u => 
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.firstName && u.firstName.toLowerCase().includes(q)) ||
        (u.lastName && u.lastName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (this.getUserBrandsDisplay(u).toLowerCase().includes(q)) ||
        (this.getUserRole(u).toLowerCase().includes(q))
      );
    }
    this.filteredUsers = result;
  }

  fetchBrands() {
    this.brandService.getBrands().subscribe({
      next: (res: any) => {
        this.brands = Array.isArray(res) ? res : (res.data || []);
      },
      error: (err) => {
        console.error('Error fetching brands', err);
      }
    });
  }

  getUserBrandList(u: any): string[] {
    if (!u) return [];
    const brandMap = new Map<number, string>();
    (this.brands || []).forEach(b => {
      if (b && b.id) brandMap.set(Number(b.id), b.name);
    });

    const foundNames: string[] = [];

    // Check brandList array of IDs returned by ListUser API
    if (Array.isArray(u.brandList) && u.brandList.length > 0) {
      u.brandList.forEach((bId: any) => {
        const name = brandMap.get(Number(bId));
        if (name && !foundNames.includes(name)) {
          foundNames.push(name);
        }
      });
    }

    // Check single brand property if string, number, or object
    if (u.brand) {
      if (typeof u.brand === 'string' && u.brand.trim() && !u.brand.includes('[object')) {
        if (!foundNames.includes(u.brand)) foundNames.push(u.brand);
      } else if (typeof u.brand === 'number') {
        const name = brandMap.get(u.brand);
        if (name && !foundNames.includes(name)) foundNames.push(name);
      } else if (typeof u.brand === 'object' && u.brand.name) {
        if (!foundNames.includes(u.brand.name)) foundNames.push(u.brand.name);
      }
    }

    return foundNames;
  }

  getUserBrandsDisplay(u: any): string {
    const list = this.getUserBrandList(u);
    return list.length > 0 ? list.join(', ') : '—';
  }

  get f() { return this.registerForm.controls; }

  getUserRole(u: any): string {
    if (u.isAdmin) return 'Admin';
    if (u.isCustomer) return 'Customer';
    if (u.isDistributor) return 'Distributor';
    return 'User';
  }

  getRoleClass(u: any): string {
    const role = this.getUserRole(u);
    if (role === 'Admin') return 'role-admin';
    if (role === 'Customer') return 'role-customer';
    if (role === 'Distributor') return 'role-distributor';
    return '';
  }

  getFullName(u: any): string {
    const fn = (u.firstName || '').trim();
    const ln = (u.lastName || '').trim();
    const name = `${fn} ${ln}`.trim();
    return name || '—';
  }

  onSubmit() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    
    const formValue = this.registerForm.value;
    const apiPayload = {
      ...formValue,
      brand: formValue.brand ? Number(formValue.brand) : null,
      brand_id: formValue.brand ? Number(formValue.brand) : null,
      brandId: formValue.brand ? Number(formValue.brand) : null,
      customer_brand: formValue.brand ? Number(formValue.brand) : null,
      customer_brand_id: formValue.brand ? Number(formValue.brand) : null,
      isAdmin: formValue.role === 'Admin',
      isCustomer: formValue.role === 'Customer',
      isDistributor: formValue.role === 'Distributor'
    };
    
    if (formValue.role === 'Customer' && formValue.brand && formValue.username) {
      const bNum = Number(formValue.brand);
      localStorage.setItem(`crm_brand_id_${String(formValue.username).toLowerCase()}`, bNum.toString());
      localStorage.setItem('crm_brand_id', bNum.toString());
      localStorage.setItem('crm_last_created_customer_brand', bNum.toString());
    }
    
    this.authService.register(apiPayload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if(res.status === 200 || res.message === 'success') {
          this.toast.success('Success', 'User created successfully.');
          this.registerForm.reset({ role: '' });
          this.submitted = false;
          this.activeTab = 'list';
          this.loadUsers();
        } else {
          this.toast.error('Registration Failed', res.message);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.error('Registration Failed', err.message);
      }
    });
  }
}
