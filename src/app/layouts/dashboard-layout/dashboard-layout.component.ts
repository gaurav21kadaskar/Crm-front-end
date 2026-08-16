import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { CallService } from '../../core/services/call.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule, ReactiveFormsModule],
  template: `
    <div class="layout-wrapper">
      <!-- Sidebar -->
      <aside class="sidebar">
        <!-- Logo -->
        <div class="sidebar-logo">
          <div class="logo-img-box">
            <img src="assets/logo.png" alt="Shri Govind Enterprises Logo" class="sidebar-logo-img" />
          </div>
          <div class="logo-text-box">
            <span class="logo-text">Shri Govind</span>
            <span class="logo-subtext">Enterprises</span>
          </div>
        </div>


        <nav class="sidebar-nav">
          <p class="nav-section-label">Main Menu</p>
          <ul class="nav-list">
            <li class="nav-item">
              <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                <span>Dashboard</span>
              </a>
            </li>

            <!-- Admin Only Links: User Management -->
            @if (authService.getRole() === 'Admin') {
              <li class="nav-item">
                <a routerLink="/create-user" routerLinkActive="active" class="nav-link">
                  <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span>User Management</span>
                </a>
              </li>
            }

            <!-- Call Management: Admin, Distributor & Customer -->
            @if (authService.getRole() === 'Admin' || authService.getRole() === 'Distributor' || authService.getRole() === 'Customer') {
              <p class="nav-section-label" style="margin-top: 1.25rem;">Calls</p>
              <li class="nav-item">
                <button (click)="toggleCallMenu()" class="nav-link-btn" [class.open]="isCallMenuOpen">
                  <div class="nav-link-btn-left">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span>Call Management</span>
                  </div>
                  <svg class="chevron-icon" [class.rotated]="isCallMenuOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                @if (isCallMenuOpen) {
                  <ul class="submenu animate-fade-in">
                    <li>
                      <a routerLink="/calls" [queryParams]="{tab: 'list'}" routerLinkActive="active" class="submenu-link">
                        <span class="submenu-dot"></span> View All Calls
                      </a>
                    </li>
                    @if (authService.getRole() !== 'Distributor') {
                      <li>
                        <a routerLink="/calls" [queryParams]="{tab: 'create'}" routerLinkActive="active" class="submenu-link">
                          <span class="submenu-dot"></span> Create New Call
                        </a>
                      </li>
                    }
                    @if (authService.getRole() === 'Admin' || authService.getRole() === 'Distributor') {
                      <li>
                        <a routerLink="/calls" [queryParams]="{tab: 'lookup'}" routerLinkActive="active" class="submenu-link">
                          <span class="submenu-dot"></span> Update by Call ID
                        </a>
                      </li>
                    }
                  </ul>
                }
              </li>
            }



            <!-- Admin Only Links: Product Management (full CRUD) -->
            @if (authService.getRole() === 'Admin') {
              <p class="nav-section-label" style="margin-top: 1.5rem;">Products</p>
              <li class="nav-item">
                <button (click)="toggleProductMenu()" class="nav-link-btn" [class.open]="isProductMenuOpen">
                  <div class="nav-link-btn-left">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    <span>Product Management</span>
                  </div>
                  <svg class="chevron-icon" [class.rotated]="isProductMenuOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                @if (isProductMenuOpen) {
                  <ul class="submenu animate-fade-in">
                    <li><a routerLink="/admin/brands" routerLinkActive="active" class="submenu-link"><span class="submenu-dot"></span> Manage Brands</a></li>
                    <li><a routerLink="/admin/products" routerLinkActive="active" class="submenu-link"><span class="submenu-dot"></span> Manage Products</a></li>
                    <li><a routerLink="/admin/models" routerLinkActive="active" class="submenu-link"><span class="submenu-dot"></span> Manage Models</a></li>
                    <li><a routerLink="/admin/issues" routerLinkActive="active" class="submenu-link"><span class="submenu-dot"></span> Manage Issues</a></li>
                    <li><a routerLink="/admin/parts" routerLinkActive="active" class="submenu-link"><span class="submenu-dot"></span> Manage Parts</a></li>
                  </ul>
                }
              </li>
            }

            <!-- Customer Only: Read-only Product Catalog -->
            @if (authService.getRole() === 'Customer') {
              <p class="nav-section-label" style="margin-top: 1.5rem;">Product Catalog</p>
              <li class="nav-item">
                <button (click)="toggleProductMenu()" class="nav-link-btn" [class.open]="isProductMenuOpen">
                  <div class="nav-link-btn-left">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    <span>Product Management</span>
                  </div>
                  <svg class="chevron-icon" [class.rotated]="isProductMenuOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                @if (isProductMenuOpen) {
                  <ul class="submenu animate-fade-in">
                    <li><a routerLink="/admin/brands" routerLinkActive="active" class="submenu-link"><span class="submenu-dot"></span> Brands</a></li>
                    <li><a routerLink="/admin/products" routerLinkActive="active" class="submenu-link"><span class="submenu-dot"></span> Products</a></li>
                    <li><a routerLink="/admin/models" routerLinkActive="active" class="submenu-link"><span class="submenu-dot"></span> Models</a></li>
                    <li><a routerLink="/admin/issues" routerLinkActive="active" class="submenu-link"><span class="submenu-dot"></span> Issues</a></li>
                    <li><a routerLink="/admin/parts" routerLinkActive="active" class="submenu-link"><span class="submenu-dot"></span> Parts</a></li>
                  </ul>
                }
              </li>
            }

            <!-- Distributor: Read-only Product Catalog -->
            @if (authService.getRole() === 'Distributor') {
              <p class="nav-section-label" style="margin-top: 1.5rem;">Product Catalog</p>
              <li class="nav-item">
                <button (click)="toggleProductMenu()" class="nav-link-btn" [class.open]="isProductMenuOpen">
                  <div class="nav-link-btn-left">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    <span>Product Management</span>
                  </div>
                  <svg class="chevron-icon" [class.rotated]="isProductMenuOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                @if (isProductMenuOpen) {
                  <ul class="submenu animate-fade-in">
                    <li><a routerLink="/admin/brands"   routerLinkActive="active" class="submenu-link"><span class="submenu-dot"></span> Brands</a></li>
                    <li><a routerLink="/admin/products" routerLinkActive="active" class="submenu-link"><span class="submenu-dot"></span> Products</a></li>
                    <li><a routerLink="/admin/models"   routerLinkActive="active" class="submenu-link"><span class="submenu-dot"></span> Models</a></li>
                    <li><a routerLink="/admin/issues"   routerLinkActive="active" class="submenu-link"><span class="submenu-dot"></span> Issues</a></li>
                    <li><a routerLink="/admin/parts"    routerLinkActive="active" class="submenu-link"><span class="submenu-dot"></span> Parts</a></li>
                  </ul>
                }
              </li>
            }
          </ul>
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Topbar -->
        <header class="topbar">
          <div class="topbar-left">
            <div class="topbar-breadcrumb">
              <span class="breadcrumb-root">Shri Govind Enterprises</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              <span class="breadcrumb-current">{{ getCurrentPageTitle() }}</span>
            </div>
          </div>
          <div class="topbar-right">
            <button class="topbar-action-btn" (click)="toggleDarkMode()" title="Toggle Dark/Light Mode">
              @if (isDarkMode) {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              } @else {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
            <div style="position: relative; display: flex; align-items: center;">
              <button class="topbar-action-btn" title="Notifications" (click)="toggleNotifications($event)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                @if (unreadCount > 0) {
                  <span class="notification-dot">{{ unreadCount }}</span>
                }
              </button>

              <!-- Dropdown -->
              @if (showNotifications) {
                <div class="notification-dropdown animate-fade-in" (click)="$event.stopPropagation()">
                  <div class="nd-header">
                    <h4>Notifications</h4>
                    @if (unreadCount > 0) {
                      <button class="nd-clear-btn" (click)="markAllAsRead()">Mark all read</button>
                    }
                  </div>
                  <div class="nd-body">
                    @if (notifications.length === 0) {
                      <div class="nd-empty">
                        <span class="nd-empty-icon">🔔</span>
                        <p>No new notifications</p>
                      </div>
                    } @else {
                      <div class="nd-list">
                        @for (n of notifications; track n.id) {
                          <div class="nd-item" [class.nd-item--unread]="!n.read" (click)="markAsRead(n)">
                            <div class="nd-item-icon" [ngClass]="n.typeClass">
                              {{ n.icon }}
                            </div>
                            <div class="nd-item-content">
                              <p class="nd-item-title">{{ n.title }}</p>
                              <span class="nd-item-time">{{ n.time }}</span>
                            </div>
                            @if (!n.read) {
                              <span class="nd-unread-indicator"></span>
                            }
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
            <div class="topbar-divider"></div>

            <!-- Clean User Profile Section -->
            <div class="topbar-user-section">
              <div class="topbar-avatar">{{ getInitial() }}</div>
              <div class="topbar-user-info">
                <span class="topbar-user-name">{{ authService.getUsername() }}</span>
                <span class="topbar-user-role">{{ authService.getRole() }}</span>
              </div>
            </div>

            <!-- Direct Action Buttons -->
            <div class="topbar-actions-group">
              <button class="btn-topbar-action btn-reset-pass" (click)="openChangePasswordModal()" title="Reset Password">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>Reset Password</span>
              </button>

              <button class="btn-topbar-action btn-logout" (click)="logout()" title="Sign Out">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- CHANGE PASSWORD MODAL -->
      @if (showPasswordModal) {
        <div class="modal-backdrop animate-fade-in" (click)="closeChangePasswordModal()">
          <div class="modal-card animate-slide-up" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-header-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div>
                <h3 class="modal-title">Change Password</h3>
                <p class="modal-subtitle">Update password for account: <strong>{{ authService.getUsername() }}</strong></p>
              </div>
              <button class="modal-close-btn" (click)="closeChangePasswordModal()">&times;</button>
            </div>

            <form [formGroup]="passwordForm" (ngSubmit)="onSubmitChangePassword()" class="modal-body">
              <div class="form-group">
                <label class="form-label">New Password *</label>
                <div class="input-password-wrapper">
                  <input 
                    [type]="showNewPass ? 'text' : 'password'" 
                    class="form-input" 
                    [class.invalid]="submittedPass && pf['newPassword'].errors"
                    formControlName="newPassword" 
                    placeholder="Enter new password"
                  />
                  <button type="button" class="eye-toggle" (click)="showNewPass = !showNewPass">
                    @if (showNewPass) {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    } @else {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                @if (submittedPass && pf['newPassword'].errors?.['required']) {
                  <span class="field-error">New password is required.</span>
                }
                @if (submittedPass && pf['newPassword'].errors?.['minlength']) {
                  <span class="field-error">Password must be at least 6 characters.</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label">Confirm New Password *</label>
                <div class="input-password-wrapper">
                  <input 
                    [type]="showConfirmPass ? 'text' : 'password'" 
                    class="form-input" 
                    [class.invalid]="submittedPass && (pf['confirmPassword'].errors || passwordMismatch)"
                    formControlName="confirmPassword" 
                    placeholder="Re-enter new password"
                  />
                  <button type="button" class="eye-toggle" (click)="showConfirmPass = !showConfirmPass">
                    @if (showConfirmPass) {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    } @else {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                @if (submittedPass && pf['confirmPassword'].errors?.['required']) {
                  <span class="field-error">Please confirm your password.</span>
                }
                @if (submittedPass && !pf['confirmPassword'].errors && passwordMismatch) {
                  <span class="field-error">Passwords do not match.</span>
                }
              </div>

              <div class="modal-footer">
                <button type="button" class="btn-secondary" (click)="closeChangePasswordModal()" [disabled]="isSubmittingPass">Cancel</button>
                <button type="submit" class="btn-primary" [disabled]="isSubmittingPass">
                  {{ isSubmittingPass ? 'Updating...' : 'Update Password' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    /* ── Layout ─────────────────────────────────── */
    .layout-wrapper {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--bg);
    }

    /* ── Sidebar ─────────────────────────────────── */
    .sidebar {
      width: 256px;
      min-width: 256px;
      background: #0f172a;
      display: flex;
      flex-direction: column;
      z-index: 20;
      overflow: hidden;
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      height: 72px;
      min-height: 72px;
      padding: 0 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      box-sizing: border-box;
    }

    .logo-img-box {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .sidebar-logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .logo-text-box {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }

    .logo-text {
      font-size: 0.95rem;
      font-weight: 800;
      color: #f8fafc;
      letter-spacing: -0.01em;
    }

    .logo-subtext {
      font-size: 0.68rem;
      font-weight: 700;
      color: #a5b4fc;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }


    .sidebar-nav {
      flex: 1;
      padding: 1.25rem 0.75rem;
      overflow-y: auto;
    }

    .sidebar-nav::-webkit-scrollbar { width: 4px; }
    .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
    .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

    .nav-section-label {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #475569;
      padding: 0 0.75rem;
      margin-bottom: 0.5rem;
    }

    .nav-list { list-style: none; padding: 0; margin: 0; }
    .nav-item { margin-bottom: 2px; }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      color: #94a3b8;
      text-decoration: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.15s ease;
    }

    .nav-link:hover {
      background: rgba(255,255,255,0.06);
      color: #e2e8f0;
    }

    .nav-link.active {
      background: linear-gradient(135deg, rgba(79,70,229,0.35), rgba(124,58,237,0.2));
      color: #a5b4fc;
      font-weight: 600;
      border: 1px solid rgba(99,102,241,0.3);
    }

    .nav-icon {
      width: 17px;
      height: 17px;
      flex-shrink: 0;
      opacity: 0.8;
    }

    .nav-link.active .nav-icon { opacity: 1; }

    /* ── Collapsible menu button ─────────────── */
    .nav-link-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0.625rem 0.75rem;
      color: #94a3b8;
      background: none;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .nav-link-btn:hover {
      background: rgba(255,255,255,0.06);
      color: #e2e8f0;
    }

    .nav-link-btn.open {
      background: rgba(255,255,255,0.05);
      color: #e2e8f0;
    }

    .nav-link-btn-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .chevron-icon {
      width: 14px;
      height: 14px;
      transition: transform 0.2s ease;
      opacity: 0.6;
    }

    .chevron-icon.rotated { transform: rotate(180deg); }

    /* ── Submenu ─────────────────────────────── */
    .submenu {
      list-style: none;
      padding: 0.25rem 0 0.25rem 1rem;
      margin: 2px 0 0 0;
    }

    .submenu-link {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.5rem 0.75rem;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: 7px;
      font-size: 0.8275rem;
      font-weight: 500;
      transition: all 0.15s ease;
    }

    .submenu-link:hover {
      background: rgba(255,255,255,0.05);
      color: #cbd5e1;
    }

    .submenu-link.active {
      color: #a5b4fc;
      background: rgba(99,102,241,0.15);
      font-weight: 600;
    }

    .submenu-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: currentColor;
      flex-shrink: 0;
      opacity: 0.7;
    }

    /* ── Sidebar Footer ──────────────────────── */
    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid rgba(255,255,255,0.06);
    }

    .sidebar-user {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      border-radius: 10px;
      background: rgba(255,255,255,0.04);
    }

    .avatar {
      width: 34px;
      height: 34px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
    }

    .sidebar-user-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .sidebar-user-name {
      font-size: 0.825rem;
      font-weight: 600;
      color: #e2e8f0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sidebar-user-role {
      font-size: 0.7rem;
      color: var(--text-secondary);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* ── Main Content ────────────────────────── */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }

    /* ── Topbar ──────────────────────────────── */
    .topbar {
      height: 72px;
      min-height: 72px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.75rem;
      z-index: 10;
      box-shadow: var(--shadow-sm);
    }

    .topbar-breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .breadcrumb-root {
      font-size: 0.8rem;
      color: #94a3b8;
      font-weight: 500;
    }

    .breadcrumb-current {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .topbar-action-btn {
      position: relative;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 9px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .topbar-action-btn:hover { background: var(--border-light); color: var(--text-primary); }

    .notification-dot {
      position: absolute;
      top: 7px;
      right: 7px;
      width: 7px;
      height: 7px;
      background: #ef4444;
      border-radius: 50%;
      border: 1.5px solid white;
    }

    .topbar-divider {
      width: 1px;
      height: 24px;
      background: var(--border);
    }

    /* ── Clean Topbar User Section & Direct Buttons ── */
    .topbar-user-section {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding-right: 0.25rem;
    }

    .topbar-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25);
    }

    .topbar-user-info {
      display: flex;
      flex-direction: column;
    }

    .topbar-user-name {
      font-size: 0.86rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.2;
    }

    .topbar-user-role {
      font-size: 0.68rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      line-height: 1.2;
    }

    .topbar-actions-group {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-left: 0.25rem;
    }

    .btn-topbar-action {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.5rem 0.9rem;
      border-radius: 9px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s ease;
      font-family: inherit;
      white-space: nowrap;
    }

    .btn-reset-pass {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      color: #334155;
    }

    .btn-reset-pass:hover {
      background: #ede9fe;
      border-color: #c4b5fd;
      color: #6d28d9;
      transform: translateY(-1px);
    }

    .btn-logout {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      color: #475569;
    }

    .btn-logout:hover {
      background: #fff1f2;
      border-color: #fecdd3;
      color: #e11d48;
      transform: translateY(-1px);
    }

    /* ── Change Password Modal ────────────────── */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1rem;
    }

    .modal-card {
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      position: relative;
    }

    .modal-header-icon {
      width: 38px;
      height: 38px;
      background: #ede9fe;
      color: #7c3aed;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .modal-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .modal-subtitle {
      font-size: 0.78rem;
      color: #64748b;
      margin: 0.15rem 0 0;
    }

    .modal-close-btn {
      position: absolute;
      right: 1.25rem;
      top: 1.25rem;
      background: none;
      border: none;
      font-size: 1.4rem;
      color: #94a3b8;
      cursor: pointer;
      line-height: 1;
      padding: 0.2rem;
    }

    .modal-close-btn:hover { color: #0f172a; }

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.15rem;
    }

    .form-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.35rem;
    }

    .input-password-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .form-input {
      width: 100%;
      padding: 0.65rem 2.4rem 0.65rem 0.85rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
      color: #0f172a;
      outline: none;
      transition: all 0.2s;
    }

    .form-input::-ms-reveal,
    .form-input::-ms-clear {
      display: none;
    }

    .form-input:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    .form-input.invalid {
      border-color: #ef4444;
    }

    .eye-toggle {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
    }

    .eye-toggle:hover { color: #475569; }

    .field-error {
      display: block;
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.3rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }

    .btn-secondary {
      padding: 0.6rem 1.1rem;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-secondary:hover { background: #e2e8f0; }

    .btn-primary {
      padding: 0.6rem 1.25rem;
      background: #4f46e5;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
      transition: all 0.15s;
    }

    .btn-primary:hover:not(:disabled) {
      background: #4338ca;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* ── Notification Dropdown ────────────────── */
    .notification-dropdown {
      position: absolute;
      top: calc(100% + 12px);
      right: 0;
      width: 320px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
      z-index: 100;
      overflow: hidden;
    }

    body.dark-theme .notification-dropdown {
      background: #111827;
      border-color: rgba(255,255,255,0.08);
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
    }

    .nd-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--border);
      background: var(--surface-2);
    }

    body.dark-theme .nd-header {
      background: #1f2937;
      border-bottom-color: rgba(255,255,255,0.08);
    }

    .nd-header h4 {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .nd-clear-btn {
      background: none;
      border: none;
      color: #4f46e5;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
    }

    .nd-clear-btn:hover {
      text-decoration: underline;
    }

    .nd-body {
      max-height: 320px;
      overflow-y: auto;
    }

    .nd-empty {
      padding: 2.5rem 1rem;
      text-align: center;
      color: var(--text-secondary);
    }

    .nd-empty-icon {
      font-size: 2rem;
      display: block;
      margin-bottom: 0.5rem;
      opacity: 0.5;
    }

    .nd-empty p {
      margin: 0;
      font-size: 0.825rem;
    }

    .nd-list {
      display: flex;
      flex-direction: column;
    }

    .nd-item {
      display: flex;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      transition: background 0.15s;
      align-items: flex-start;
      position: relative;
    }

    body.dark-theme .nd-item {
      border-bottom-color: rgba(255,255,255,0.06);
    }

    .nd-item:hover {
      background: var(--surface-2);
    }

    body.dark-theme .nd-item:hover {
      background: #1f2937;
    }

    .nd-item--unread {
      background: rgba(79, 70, 229, 0.03);
    }

    body.dark-theme .nd-item--unread {
      background: rgba(79, 70, 229, 0.05);
    }

    .nd-item-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .nd-icon-pending { background: #fef3c7; color: #92400e; }
    .nd-icon-progress { background: #dbeafe; color: #1e40af; }
    .nd-icon-resolved { background: #dcfce7; color: #166534; }

    .nd-item-content {
      flex: 1;
      min-width: 0;
    }

    .nd-item-title {
      margin: 0 0 0.2rem 0;
      font-size: 0.8125rem;
      color: var(--text-primary);
      line-height: 1.3;
      font-weight: 500;
      word-break: break-word;
      text-align: left;
    }

    .nd-item--unread .nd-item-title {
      font-weight: 700;
    }

    .nd-item-time {
      font-size: 0.7rem;
      color: var(--text-secondary);
      display: block;
      text-align: left;
    }

    .nd-unread-indicator {
      width: 6px;
      height: 6px;
      background: #4f46e5;
      border-radius: 50%;
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
    }

    .notification-dot {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 16px;
      height: 16px;
      background: #ef4444;
      border-radius: 50%;
      border: 1.5px solid var(--surface);
      color: white;
      font-size: 0.65rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 3px;
      box-sizing: border-box;
    }

    body.dark-theme .notification-dot {
      border-color: #0f172a;
    }

    /* ── Page Content ────────────────────────── */
    .page-content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }

    .animate-fade-in {
      animation: fadeIn 0.2s ease-out both;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DashboardLayoutComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  private callService = inject(CallService);

  isProductMenuOpen = false;
  isCallMenuOpen = false;
  isDarkMode = false;

  // Notification properties
  showNotifications = false;
  unreadCount = 0;
  notifications: Array<{
    id: string;
    title: string;
    time: string;
    read: boolean;
    icon: string;
    typeClass: string;
  }> = [];

  private readonly productRoutes = ['/admin/brands', '/admin/products', '/admin/models', '/admin/issues', '/admin/parts'];
  private readonly callRoutes = ['/calls'];

  private isProductRouteActive(): boolean {
    return this.productRoutes.some(r => this.router.url.startsWith(r));
  }

  private isCallRouteActive(): boolean {
    return this.callRoutes.some(r => this.router.url.startsWith(r));
  }

  ngOnInit() {
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }

    if (this.isProductRouteActive()) this.isProductMenuOpen = true;
    if (this.isCallRouteActive()) this.isCallMenuOpen = true;

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isProductRouteActive()) this.isProductMenuOpen = true;
      if (this.isCallRouteActive()) this.isCallMenuOpen = true;
    });

    this.loadNotifications();
  }

  loadNotifications() {
    this.callService.getCalls().subscribe({
      next: (res: any) => {
        const rawCalls = Array.isArray(res) ? res : (res.data || []);
        
        // Filter calls for Customers just like dashboard does
        let filteredCalls = [...rawCalls];
        const role = this.authService.getRole();
        const username = this.authService.getUsername() || '';

        if (role === 'Customer') {
          filteredCalls = rawCalls.filter((c: any) => {
            const fn = (c.customerDetail?.firstName || '').toLowerCase();
            const ln = (c.customerDetail?.lastName || '').toLowerCase();
            const fullname = `${fn} ${ln}`.trim();
            const u = username.toLowerCase();
            return fn.includes(u) || ln.includes(u) || fullname.includes(u) || (c.customerName || '').toLowerCase().includes(u);
          });
        }

        // Sort by id desc
        filteredCalls.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));

        // Generate dynamic notifications
        const notificationItems = filteredCalls.map(c => {
          let title = '';
          let icon = '📝';
          let typeClass = 'nd-icon-pending';
          const callIdStr = c.callNumber || c.callId || ('#' + c.id);
          const custName = this.getCustomerName(c);

          const status = (c.status || 'Pending').toUpperCase();
          if (status === 'PENDING' || status === 'OPEN') {
            title = `New service call ${callIdStr} registered for ${custName}.`;
            icon = '📝';
            typeClass = 'nd-icon-pending';
          } else if (status === 'IN PROGRESS') {
            title = `Service call ${callIdStr} is in progress under technician ${c.technicianAssigned || 'assigned technician'}.`;
            icon = '🔧';
            typeClass = 'nd-icon-progress';
          } else {
            title = `Service call ${callIdStr} has been successfully resolved.`;
            icon = '✅';
            typeClass = 'nd-icon-resolved';
          }

          // Format date/time
          let displayTime = 'Just now';
          if (c.createdAt) {
            displayTime = c.createdAt;
          }

          return {
            id: String(c.id || callIdStr),
            title,
            time: displayTime,
            read: false,
            icon,
            typeClass
          };
        });

        // Load read states from local storage to keep state persistent
        const readListStr = localStorage.getItem('read_notifications');
        const readIds = readListStr ? JSON.parse(readListStr) : [];

        this.notifications = notificationItems.map(n => {
          if (readIds.includes(n.id)) {
            n.read = true;
          }
          return n;
        });

        this.unreadCount = this.notifications.filter(n => !n.read).length;
      },
      error: () => {
        this.notifications = [];
        this.unreadCount = 0;
      }
    });
  }

  getCustomerName(call: any): string {
    if (!call) return 'Customer';
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
    return 'Customer';
  }

  showUserDropdown = false;

  toggleUserDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.showUserDropdown = !this.showUserDropdown;
    this.showNotifications = false;
  }

  toggleNotifications(event: MouseEvent) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    this.showUserDropdown = false;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.showNotifications = false;
    this.showUserDropdown = false;
  }

  markAsRead(n: any) {
    n.read = true;
    const readListStr = localStorage.getItem('read_notifications');
    const readIds = readListStr ? JSON.parse(readListStr) : [];
    if (!readIds.includes(n.id)) {
      readIds.push(n.id);
      localStorage.setItem('read_notifications', JSON.stringify(readIds));
    }
    this.unreadCount = this.notifications.filter(item => !item.read).length;
  }

  markAllAsRead() {
    const readListStr = localStorage.getItem('read_notifications');
    const readIds = readListStr ? JSON.parse(readListStr) : [];
    this.notifications.forEach(n => {
      n.read = true;
      if (!readIds.includes(n.id)) {
        readIds.push(n.id);
      }
    });
    localStorage.setItem('read_notifications', JSON.stringify(readIds));
    this.unreadCount = 0;
  }

  toggleProductMenu() {
    this.isProductMenuOpen = !this.isProductMenuOpen;
  }

  toggleCallMenu() {
    this.isCallMenuOpen = !this.isCallMenuOpen;
  }

  getInitial(): string {
    const name = this.authService.getUsername();
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  getCurrentPageTitle(): string {
    const url = this.router.url;
    if (url === '/dashboard') return 'Dashboard';
    if (url.startsWith('/admin/brands')) return 'Manage Brands';
    if (url.startsWith('/admin/products')) return 'Manage Products';
    if (url.startsWith('/admin/models')) return 'Manage Models';
    if (url.startsWith('/admin/issues')) return 'Manage Issues';
    if (url.startsWith('/admin/parts')) return 'Manage Parts';
    if (url.startsWith('/create-user')) return 'Create User';
    if (url.startsWith('/calls')) return 'Call Management';
    if (url.startsWith('/customer/products')) return 'Products';
    return 'Dashboard';
  }


  // ── Change Password Modal State ──
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  showPasswordModal = false;
  showNewPass = false;
  showConfirmPass = false;
  isSubmittingPass = false;
  submittedPass = false;
  passwordMismatch = false;

  passwordForm: FormGroup = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  get pf() {
    return this.passwordForm.controls;
  }

  openChangePasswordModal() {
    this.showPasswordModal = true;
    this.submittedPass = false;
    this.passwordMismatch = false;
    this.showNewPass = false;
    this.showConfirmPass = false;
    this.passwordForm.reset();
  }

  closeChangePasswordModal() {
    if (this.isSubmittingPass) return;
    this.showPasswordModal = false;
  }

  onSubmitChangePassword() {
    this.submittedPass = true;
    this.passwordMismatch = false;

    if (this.passwordForm.invalid) {
      return;
    }

    const { newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    this.isSubmittingPass = true;
    this.authService.resetPassword(newPassword).subscribe({
      next: (res: any) => {
        this.isSubmittingPass = false;
        if (res?.status === 200 || res?.message === 'success') {
          this.toast.success('Success', 'Password updated successfully!');
          this.closeChangePasswordModal();
        } else {
          this.toast.error('Failed', res?.message || 'Could not reset password.');
        }
      },
      error: (err: any) => {
        this.isSubmittingPass = false;
        this.toast.error('Error', err?.error?.message || err?.message || 'Password update failed.');
      }
    });
  }

  logout() {
    this.authService.logout();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }
}
