import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout-wrapper">
      <!-- Sidebar -->
      <aside class="sidebar">
        <!-- Logo -->
        <div class="sidebar-logo">
          <div class="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span class="logo-text">CRM Pro</span>
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

            <!-- Admin Only Links: Create User -->
            @if (authService.getRole() === 'Admin') {
              <li class="nav-item">
                <a routerLink="/create-user" routerLinkActive="active" class="nav-link">
                  <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  <span>Create User</span>
                </a>
              </li>
            }

            <!-- Call Management Collapsible (placed below Create User) -->
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
                  <li>
                    <a routerLink="/calls" [queryParams]="{tab: 'create'}" routerLinkActive="active" class="submenu-link">
                      <span class="submenu-dot"></span> Create New Call
                    </a>
                  </li>
                  <li>
                    <a routerLink="/calls" [queryParams]="{tab: 'lookup'}" routerLinkActive="active" class="submenu-link">
                      <span class="submenu-dot"></span> Update by Call ID
                    </a>
                  </li>
                </ul>
              }
            </li>

            <!-- Admin Only Links: Product Management -->
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
                    <li>
                      <a routerLink="/admin/brands" routerLinkActive="active" class="submenu-link">
                        <span class="submenu-dot"></span> Manage Brands
                      </a>
                    </li>
                    <li>
                      <a routerLink="/admin/products" routerLinkActive="active" class="submenu-link">
                        <span class="submenu-dot"></span> Manage Products
                      </a>
                    </li>
                    <li>
                      <a routerLink="/admin/models" routerLinkActive="active" class="submenu-link">
                        <span class="submenu-dot"></span> Manage Models
                      </a>
                    </li>
                    <li>
                      <a routerLink="/admin/issues" routerLinkActive="active" class="submenu-link">
                        <span class="submenu-dot"></span> Manage Issues
                      </a>
                    </li>
                  </ul>
                }
              </li>
            }
          </ul>
        </nav>

        <!-- User Card at Bottom -->
        <div class="sidebar-footer">
          <div class="sidebar-user">
            <div class="avatar">{{ getInitial() }}</div>
            <div class="sidebar-user-info">
              <span class="sidebar-user-name">{{ authService.getUsername() }}</span>
              <span class="sidebar-user-role">{{ authService.getRole() }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Topbar -->
        <header class="topbar">
          <div class="topbar-left">
            <div class="topbar-breadcrumb">
              <span class="breadcrumb-root">CRM Pro</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              <span class="breadcrumb-current">{{ getCurrentPageTitle() }}</span>
            </div>
          </div>
          <div class="topbar-right">
            <button class="topbar-action-btn" title="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span class="notification-dot"></span>
            </button>
            <div class="topbar-divider"></div>
            <div class="topbar-user">
              <div class="topbar-avatar">{{ getInitial() }}</div>
              <div class="topbar-user-info">
                <span class="topbar-user-name">{{ authService.getUsername() }}</span>
                <span class="topbar-user-role">{{ authService.getRole() }}</span>
              </div>
            </div>
            <button class="logout-btn" (click)="logout()" title="Logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </div>
        </header>

        <!-- Page Content -->
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    /* ── Layout ─────────────────────────────────── */
    .layout-wrapper {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: #f1f5f9;
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
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 12px rgba(79,70,229,0.35);
      flex-shrink: 0;
    }

    .logo-text {
      font-size: 1.1rem;
      font-weight: 800;
      color: #f8fafc;
      letter-spacing: -0.02em;
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
      color: #64748b;
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
      color: #64748b;
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
      height: 60px;
      min-height: 60px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.75rem;
      z-index: 10;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
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
      color: #0f172a;
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
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 9px;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .topbar-action-btn:hover { background: #f1f5f9; color: #0f172a; }

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
      background: #e2e8f0;
    }

    .topbar-user {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }

    .topbar-avatar {
      width: 34px;
      height: 34px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
    }

    .topbar-user-info {
      display: flex;
      flex-direction: column;
    }

    .topbar-user-name {
      font-size: 0.825rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.2;
    }

    .topbar-user-role {
      font-size: 0.68rem;
      color: #94a3b8;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      line-height: 1.2;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.875rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .logout-btn:hover {
      background: #fee2e2;
      border-color: #fca5a5;
      color: #dc2626;
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
  isProductMenuOpen = false;
  isCallMenuOpen = false;

  private readonly productRoutes = ['/admin/brands', '/admin/products', '/admin/models', '/admin/issues'];
  private readonly callRoutes = ['/calls'];

  private isProductRouteActive(): boolean {
    return this.productRoutes.some(r => this.router.url.startsWith(r));
  }

  private isCallRouteActive(): boolean {
    return this.callRoutes.some(r => this.router.url.startsWith(r));
  }

  ngOnInit() {
    if (this.isProductRouteActive()) this.isProductMenuOpen = true;
    if (this.isCallRouteActive()) this.isCallMenuOpen = true;

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isProductRouteActive()) this.isProductMenuOpen = true;
      if (this.isCallRouteActive()) this.isCallMenuOpen = true;
    });
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
    if (url.startsWith('/create-user')) return 'Create User';
    if (url.startsWith('/calls')) return 'Call Management';
    return 'Dashboard';
  }

  logout() {
    this.authService.logout();
  }
}
