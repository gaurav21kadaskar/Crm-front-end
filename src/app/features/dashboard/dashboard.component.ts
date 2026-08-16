import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CallService } from '../../core/services/call.service';
import { BrandService } from '../../core/services/brand.service';
import { ProductService } from '../../core/services/product.service';
import { ProductModelService } from '../../core/services/product-model.service';
import { ProductPartService } from '../../core/services/product-part.service';
import { Call } from '../../core/models/call.model';
import { Brand } from '../../core/models/brand.model';
import { Product } from '../../core/models/product.model';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container animate-fade-in">

      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <div class="welcome-banner-left">
          <div class="welcome-avatar">{{ getInitial() }}</div>
          <div class="welcome-text">
            <h2 class="welcome-heading">Welcome back, <span class="welcome-name">{{ authService.getUsername() }}</span>! 👋</h2>
            <p class="welcome-sub">
              @if (isCustomer) {
                Here is a real-time overview of your service calls, status updates, and registered products.
              } @else {
                Here is what's happening with your service calls and products today.
              }
            </p>
          </div>
        </div>
        <div class="welcome-right">
          <div class="role-badge-wrap">
            <span class="role-chip">{{ authService.getRole() }}</span>
            @if (isCustomer && customerBrandName) {
              <span class="brand-chip">🏷️ {{ customerBrandName }}</span>
            }
          </div>
          <button class="refresh-dash-btn" (click)="manualRefresh()" [disabled]="refreshing" title="Refresh Real-time Data">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" [class.spinning]="refreshing"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            {{ refreshing ? 'Updating...' : 'Sync Real-time' }}
          </button>
        </div>
      </div>

      <!-- Real-time Stats Grid (Customized for Customer & Admin/Distributor) -->
      <div class="stats-grid">
        <!-- 1. TOTAL CALLS -->
        <div class="stat-card stat-card--purple">
          <div class="stat-icon-wrap calls-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div class="stat-details">
            <span class="stat-label">TOTAL CALLS</span>
            <span class="stat-value">{{ stats.totalCalls }}</span>
            <span class="stat-subtext">{{ isCustomer ? 'Registered calls' : 'All registered cases' }}</span>
          </div>
        </div>

        <!-- 2. OPEN / PENDING CALLS -->
        <div class="stat-card stat-card--amber">
          <div class="stat-icon-wrap pending-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="stat-details">
            <span class="stat-label">OPEN / PENDING</span>
            <span class="stat-value">{{ stats.pendingCalls }}</span>
            <span class="stat-subtext">Waiting for assignment</span>
          </div>
        </div>

        <!-- 3. IN PROGRESS / ACTION NEEDED -->
        @if (isCustomer) {
          <div class="stat-card stat-card--rose" [class.stat-card-highlight]="stats.pendingApprovalCalls > 0">
            <div class="stat-icon-wrap approval-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div class="stat-details">
              <span class="stat-label">PENDING APPROVAL</span>
              <span class="stat-value">{{ stats.pendingApprovalCalls }}</span>
              <span class="stat-subtext">{{ stats.pendingApprovalCalls > 0 ? 'Requires your confirmation' : 'No pending closures' }}</span>
            </div>
          </div>
        } @else {
          <div class="stat-card stat-card--blue">
            <div class="stat-icon-wrap progress-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <div class="stat-details">
              <span class="stat-label">IN PROGRESS</span>
              <span class="stat-value">{{ stats.inProgressCalls }}</span>
              <span class="stat-subtext">Active technician updates</span>
            </div>
          </div>
        }

        <!-- 4. RESOLVED / CLOSED -->
        <div class="stat-card stat-card--green">
          <div class="stat-icon-wrap resolved-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="stat-details">
            <span class="stat-label">{{ isCustomer ? 'CLOSED / COMPLETED' : 'RESOLVED CALLS' }}</span>
            <span class="stat-value">{{ stats.resolvedCalls }}</span>
            <span class="stat-subtext">Successfully fulfilled</span>
          </div>
        </div>
      </div>

      <!-- MAIN DASHBOARD CONTENT GRID -->
      <div class="dashboard-content-grid" [class.grid-single]="isCustomer">
        
        <!-- SECTION 1: RECENT REAL-TIME CALLS TABLE -->
        <div class="recent-calls-section card">
          <div class="section-header">
            <div>
              <h3>Recent Service Calls</h3>
              <p>{{ isCustomer ? 'Live status & updates on registered calls' : 'Latest updates in customer service' }}</p>
            </div>
            <a routerLink="/calls" [queryParams]="{tab: 'list'}" class="view-all">View All Calls →</a>
          </div>
          
          <div class="table-responsive">
            <table class="calls-table">
              <thead>
                <tr>
                  <th>CALL ID</th>
                  <th>CUSTOMER & PHONE</th>
                  <th>PRODUCT</th>
                  <th>STATUS</th>
                  <th>PRIORITY</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                @for (call of recentCalls; track call.id) {
                  <tr>
                    <td class="call-id-cell">{{ call.id }}</td>
                    <td>
                      <div class="table-cust-cell">
                        <span class="table-cust-name">{{ call.customer }}</span>
                        <span class="table-cust-phone">{{ call.phone }}</span>
                      </div>
                    </td>
                    <td><span class="table-prod-name">{{ call.productInfo }}</span></td>
                    <td>
                      <span class="status-badge" [ngClass]="getStatusClass(call.status)">
                        {{ call.status }}
                      </span>
                    </td>
                    <td>
                      <span class="priority-badge" [ngClass]="'priority-' + call.priority.toLowerCase()">
                        {{ call.priority }}
                      </span>
                    </td>
                    <td>
                      <a routerLink="/calls" [queryParams]="{tab: 'list'}" class="btn-table-view">
                        View
                      </a>
                    </td>
                  </tr>
                }
                @if (recentCalls.length === 0) {
                  <tr>
                    <td colspan="6" class="text-center empty-state-cell">
                      <div class="empty-icon-wrap">📋</div>
                      <p class="empty-title">No service calls found</p>
                      <p class="empty-sub">You have not registered any service requests yet.</p>
                      @if (isCustomer) {
                        <a routerLink="/calls" [queryParams]="{tab: 'create'}" class="btn-empty-action">+ Register First Call</a>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- SECTION 2: SIDE SUMMARY (Only for Admin / non-customer) -->
        @if (!isCustomer && authService.getRole() !== 'Distributor') {
          <div class="product-summary-section card">
            <div class="section-header">
              <div>
                <h3>Product Summary</h3>
                <span class="active-items">Active items in directory</span>
              </div>
            </div>
            
            <div class="summary-item">
              <div class="summary-item-header">
                <span>Brands</span>
                <span class="summary-count">{{ summary.brands }}</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar progress-brand" [style.width.%]="getBrandsPercentage()"></div>
              </div>
            </div>

            <div class="summary-item">
              <div class="summary-item-header">
                <span>Products</span>
                <span class="summary-count">{{ summary.products }}</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar progress-product" [style.width.%]="getProductsPercentage()"></div>
              </div>
            </div>

            <div class="quick-actions">
              <p class="qa-label">Quick Actions</p>
              <a routerLink="/calls" [queryParams]="{tab: 'create'}" class="qa-btn">+ New Service Call</a>
              <a routerLink="/calls" [queryParams]="{tab: 'list'}" class="qa-btn qa-btn--outline">View My Calls</a>
            </div>
          </div>
        }
      </div>

      <!-- Quick Action Floating/Bottom Banner for Customer -->
      @if (isCustomer) {
        <div class="customer-cta-banner animate-fade-in">
          <div class="cta-left">
            <div class="cta-icon">🛠️</div>
            <div>
              <h4 class="cta-title">Need technical support or service?</h4>
              <p class="cta-desc">Register a new call anytime. Our distributors and technicians are ready to assist you.</p>
            </div>
          </div>
          <div class="cta-right">
            <a routerLink="/calls" [queryParams]="{tab: 'create'}" class="btn-cta-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Register New Call
            </a>
            <a routerLink="/calls" [queryParams]="{tab: 'list'}" class="btn-cta-secondary">
              View All Calls
            </a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 0.5rem;
    }

    /* ── Welcome Banner ─────────────────────────── */
    .welcome-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
      border-radius: 18px;
      padding: 1.75rem 2rem;
      color: #fff;
      margin-bottom: 2rem;
      box-shadow: 0 10px 30px -8px rgba(49, 46, 129, 0.4);
      position: relative;
      overflow: hidden;
    }

    .welcome-banner::after {
      content: '';
      position: absolute;
      right: -30px;
      top: -30px;
      width: 180px;
      height: 180px;
      background: radial-gradient(circle, rgba(129, 140, 248, 0.25) 0%, rgba(255,255,255,0) 70%);
      border-radius: 50%;
    }

    .welcome-banner-left {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      z-index: 1;
    }

    .welcome-avatar {
      width: 52px;
      height: 52px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      font-weight: 800;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
      flex-shrink: 0;
    }

    .welcome-heading {
      margin: 0 0 0.25rem 0;
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .welcome-name {
      color: #a5b4fc;
    }

    .welcome-sub {
      margin: 0;
      color: rgba(255,255,255,0.8);
      font-size: 0.875rem;
    }

    .welcome-right {
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.75rem;
    }

    .role-badge-wrap {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .role-chip {
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.3);
      color: #fff;
      padding: 0.35rem 0.9rem;
      border-radius: 2rem;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      backdrop-filter: blur(6px);
    }

    .brand-chip {
      background: rgba(245, 158, 11, 0.25);
      border: 1px solid rgba(251, 191, 36, 0.4);
      color: #fef3c7;
      padding: 0.35rem 0.85rem;
      border-radius: 2rem;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.03em;
    }

    .refresh-dash-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      color: #fff;
      padding: 0.4rem 1rem;
      border-radius: 2rem;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }
    .refresh-dash-btn:hover { background: rgba(255,255,255,0.28); }
    .refresh-dash-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .spinning { animation: spinIcon 0.8s linear infinite; }
    @keyframes spinIcon { to { transform: rotate(360deg); } }

    /* ── Stats Grid ─────────────────────────────── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    
    .stat-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 1.35rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px -4px rgba(0,0,0,0.08);
      border-color: #cbd5e1;
    }

    .stat-card-highlight {
      border: 1.5px solid #fca5a5 !important;
      background: #fff5f5 !important;
    }

    .stat-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .calls-icon    { background: #ede9fe; color: #7c3aed; }
    .pending-icon  { background: #fef3c7; color: #d97706; }
    .progress-icon { background: #e0f2fe; color: #0284c7; }
    .approval-icon { background: #fee2e2; color: #dc2626; }
    .resolved-icon { background: #dcfce7; color: #16a34a; }

    .stat-details {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #64748b;
      margin-bottom: 0.15rem;
    }

    .stat-value {
      font-size: 1.65rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.15;
    }

    .stat-subtext {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 0.2rem;
    }

    /* ── Content Grid ────────────────────────────── */
    .dashboard-content-grid {
      display: grid;
      grid-template-columns: 2.2fr 1fr;
      gap: 1.5rem;
    }

    .dashboard-content-grid.grid-single {
      grid-template-columns: 1fr;
    }

    .card {
      background: #ffffff;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      border: 1px solid #e2e8f0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #f1f5f9;
    }
    
    .section-header h3 {
      margin: 0 0 0.2rem 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
    }
    
    .section-header p, .active-items {
      margin: 0;
      font-size: 0.82rem;
      color: #64748b;
    }

    .view-all {
      font-size: 0.82rem;
      color: #4f46e5;
      text-decoration: none;
      font-weight: 700;
      transition: color 0.15s;
    }
    .view-all:hover { color: #3730a3; text-decoration: underline; }

    /* ── Table ────────────────────────────────────── */
    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }
    
    .calls-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    
    .calls-table th {
      text-align: left;
      font-size: 0.72rem;
      font-weight: 700;
      color: #64748b;
      padding: 0.75rem 0.85rem;
      background: #f8fafc;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .calls-table td {
      padding: 0.9rem 0.85rem;
      color: #1e293b;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    .calls-table tr:hover td {
      background: #fcfcfd;
    }

    .call-id-cell {
      font-family: monospace;
      font-weight: 700;
      color: #4f46e5;
      font-size: 0.85rem;
    }

    .table-cust-cell {
      display: flex;
      flex-direction: column;
    }

    .table-cust-name {
      font-weight: 600;
      color: #0f172a;
    }

    .table-cust-phone {
      font-size: 0.75rem;
      color: #64748b;
    }

    .table-prod-name {
      font-weight: 500;
      color: #334155;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 20px;
    }
    
    .status-pending  { background: #fef3c7; color: #b45309; }
    .status-progress { background: #e0f2fe; color: #0284c7; }
    .status-approval { background: #fee2e2; color: #dc2626; }
    .status-resolved { background: #dcfce7; color: #15803d; }
    .status-closed   { background: #f1f5f9; color: #475569; }

    .priority-badge {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .priority-low    { background: #f1f5f9; color: #475569; }
    .priority-medium { background: #e0f2fe; color: #0369a1; }
    .priority-high   { background: #ffedd5; color: #c2410c; }
    .priority-urgent { background: #fee2e2; color: #b91c1c; }

    .btn-table-view {
      padding: 0.35rem 0.75rem;
      background: #f1f5f9;
      color: #4338ca;
      font-size: 0.78rem;
      font-weight: 600;
      border-radius: 6px;
      text-decoration: none;
      transition: background 0.15s;
    }
    .btn-table-view:hover { background: #e0e7ff; }

    .empty-state-cell {
      padding: 3rem 1rem !important;
      color: #64748b;
    }

    .empty-icon-wrap { font-size: 2rem; margin-bottom: 0.5rem; }
    .empty-title { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin: 0 0 0.25rem; }
    .empty-sub { font-size: 0.8rem; color: #64748b; margin: 0 0 1rem; }
    .btn-empty-action {
      display: inline-block;
      padding: 0.5rem 1.25rem;
      background: #4f46e5;
      color: #fff;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
    }

    /* ── Product Summary Side Card ───────────────── */
    .summary-item { margin-bottom: 1.15rem; }
    .summary-item-header { display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 600; color: #334155; margin-bottom: 0.4rem; }
    .progress-bar-container { height: 6px; background-color: #f1f5f9; border-radius: 1rem; overflow: hidden; }
    .progress-bar { height: 100%; border-radius: 1rem; }
    .progress-brand   { background: linear-gradient(90deg, #4f46e5, #7c3aed); }
    .progress-product { background: linear-gradient(90deg, #0284c7, #38bdf8); }

    .quick-actions { margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid #f1f5f9; }
    .qa-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #64748b; margin: 0 0 0.75rem 0; }
    .qa-btn { display: block; width: 100%; padding: 0.6rem 1rem; margin-bottom: 0.5rem; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border-radius: 8px; text-decoration: none; font-size: 0.82rem; font-weight: 600; text-align: center; }
    .qa-btn--outline { background: transparent; color: #4f46e5; border: 1.5px solid #4f46e5; }

    /* ── Customer Bottom Banner ──────────────────── */
    .customer-cta-banner {
      margin-top: 2rem;
      background: #ffffff;
      border: 1.5px solid #e0e7ff;
      border-left: 5px solid #4f46e5;
      border-radius: 14px;
      padding: 1.35rem 1.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.06);
    }

    .cta-left { display: flex; align-items: center; gap: 1rem; }
    .cta-icon { font-size: 1.8rem; flex-shrink: 0; }
    .cta-title { margin: 0 0 0.2rem 0; font-size: 0.98rem; font-weight: 700; color: #0f172a; }
    .cta-desc { margin: 0; font-size: 0.82rem; color: #64748b; }
    .cta-right { display: flex; gap: 0.75rem; flex-shrink: 0; }

    .btn-cta-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.6rem 1.2rem;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: #ffffff;
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: 8px;
      text-decoration: none;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
      transition: all 0.15s;
    }
    .btn-cta-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4); }

    .btn-cta-secondary {
      display: inline-flex;
      align-items: center;
      padding: 0.6rem 1.1rem;
      background: #f1f5f9;
      color: #334155;
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: 8px;
      text-decoration: none;
      border: 1px solid #cbd5e1;
    }
    .btn-cta-secondary:hover { background: #e2e8f0; }

    .animate-fade-in { animation: fadeIn 0.25s ease-out both; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private callService = inject(CallService);
  private brandService = inject(BrandService);
  private productService = inject(ProductService);
  private callPollSub?: Subscription;

  refreshing = false;
  isCustomer = false;
  customerBrandName = '';

  stats = {
    totalCalls: 0,
    pendingCalls: 0,
    inProgressCalls: 0,
    pendingApprovalCalls: 0,
    resolvedCalls: 0
  };

  recentCalls: Array<{ id: string; customer: string; phone: string; productInfo: string; status: string; priority: string }> = [];

  summary = {
    brands: 0,
    products: 0
  };

  brands: Brand[] = [];
  products: Product[] = [];

  getInitial(): string {
    const name = this.authService.getUsername();
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  ngOnInit() {
    this.isCustomer = this.authService.getRole() === 'Customer';
    this.loadData();

    // Poll calls every 8 seconds for real-time live sync
    this.callPollSub = interval(8000).subscribe(() => {
      this.loadCalls(false);
    });
  }

  ngOnDestroy() {
    this.callPollSub?.unsubscribe();
  }

  manualRefresh() {
    this.refreshing = true;
    this.loadData();
  }

  private parseArray(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.results)) return res.results;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  }

  loadData() {
    this.refreshing = true;
    this.brandService.getBrands().subscribe({
      next: (res: any) => {
        this.brands = this.parseArray(res);
        this.summary.brands = this.brands.length;
        
        // Resolve Customer Brand Name
        if (this.isCustomer) {
          const bId = this.authService.getBrandId();
          if (bId) {
            const found = this.brands.find(b => b.id === bId || b.id === Number(bId));
            if (found) this.customerBrandName = found.name;
          }
        }
        this.loadProducts();
      },
      error: () => {
        this.loadProducts();
      }
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        this.products = this.parseArray(res);
        this.summary.products = this.products.length;
        this.loadCalls(true);
      },
      error: () => {
        this.loadCalls(true);
      }
    });
  }

  private myCreatedCallsKey(): string {
    const uid = this.authService.getUserId();
    return uid ? `crm_my_created_calls_${uid}` : 'crm_my_created_calls_anon';
  }

  loadCalls(showSpinner = false) {
    if (showSpinner) this.refreshing = true;

    this.callService.getCalls().subscribe({
      next: (res: any) => {
        let rawCalls = this.parseArray(res);
        
        // Merge Customer's created calls from local storage for real-time accuracy
        if (this.isCustomer) {
          rawCalls = this.mergeCustomerCalls(rawCalls);
        }

        this.processCalls(rawCalls);
        this.refreshing = false;
      },
      error: () => {
        if (this.isCustomer) {
          const fallback = this.mergeCustomerCalls([]);
          this.processCalls(fallback);
        }
        this.refreshing = false;
      }
    });
  }

  private mergeCustomerCalls(backendCalls: any[]): any[] {
    try {
      const myKeys: string[] = JSON.parse(localStorage.getItem(this.myCreatedCallsKey()) || '[]');
      if (!myKeys.length) return backendCalls;

      const detailsMap = JSON.parse(localStorage.getItem('crm_call_details_map') || '{}');
      const presentKeys = new Set<string>();
      
      backendCalls.forEach(c => {
        [c.callNumber, c.callId, c.call_number, c.id ? String(c.id) : null]
          .filter(Boolean)
          .forEach(k => presentKeys.add(String(k)));
      });

      const toAdd: any[] = [];
      for (const key of myKeys) {
        if (presentKeys.has(key)) continue;
        const raw = detailsMap[key] || detailsMap[key.toLowerCase()];
        if (!raw || raw.status === 400 || raw.status === '400') continue;
        toAdd.push(raw);
        presentKeys.add(key);
      }

      return [...toAdd, ...backendCalls];
    } catch {
      return backendCalls;
    }
  }

  private getUpdatedCallMap(): { [callNum: string]: any } {
    try {
      const data = localStorage.getItem('crm_updated_calls_map');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  processCalls(rawCalls: any[]) {
    const map = this.getUpdatedCallMap();
    
    let processed = rawCalls.map(c => {
      const cNum = c.callNumber || c.callId || (c.id ? '#' + c.id : '');
      const rawId = c.id ? String(c.id) : '';
      const cNumClean = cNum.replace(/^#/, '').trim();
      const rawIdClean = rawId.replace(/^#/, '').trim();

      const override = map[cNum] ||
                       map[cNumClean] ||
                       map[cNum.toLowerCase()] ||
                       map[cNumClean.toLowerCase()] ||
                       (rawId ? map[rawId] : null) ||
                       (rawIdClean ? map[rawIdClean] : null);

      if (override) {
        return {
          ...c,
          status: override.status || c.status,
          priority: override.priority || c.priority
        };
      }
      return c;
    });

    // Real-time Counts
    const UP = (s: string) => s ? String(s).trim().toUpperCase().replace(/[\s_-]+/g, '') : '';

    this.stats.totalCalls = processed.length;

    this.stats.pendingCalls = processed.filter(c => {
      const s = UP(c.status);
      return s === 'OPEN' || s === 'PENDING' || s === '';
    }).length;

    this.stats.inProgressCalls = processed.filter(c => {
      const s = UP(c.status);
      return s === 'INPROGRESS';
    }).length;

    this.stats.pendingApprovalCalls = processed.filter(c => {
      const s = UP(c.status);
      return s === 'PENDINGFORAPPROVAL' || s === 'PENDINGAPPROVAL';
    }).length;

    this.stats.resolvedCalls = processed.filter(c => {
      const s = UP(c.status);
      return s === 'COMPLETED' || s === 'CLOSED' || s === 'RESOLVED' || s === 'CANCELLED';
    }).length;

    // Recent 5 Calls for table
    this.recentCalls = processed.slice(0, 5).map(c => {
      const pId = c.productDetail?.product || c.product;
      let rawStatus = c.status || 'Open';
      const up = UP(rawStatus);

      if (up === 'OPEN' || up === 'PENDING') rawStatus = 'Open';
      else if (up === 'INPROGRESS') rawStatus = 'In Progress';
      else if (up === 'PENDINGFORAPPROVAL' || up === 'PENDINGAPPROVAL') rawStatus = 'Pending Approval';
      else if (up === 'COMPLETED') rawStatus = 'Completed';
      else if (up === 'CLOSED') rawStatus = 'Closed';
      else if (up === 'CANCELLED' || up === 'CANCELED') rawStatus = 'Cancelled';

      const custObj = c.customerDetail || {};
      const contObj = c.contactDetail || {};
      const fn = custObj.firstName || '';
      const ln = custObj.lastName || '';
      const custName = (fn + ' ' + (ln !== '.' ? ln : '')).trim() || c.customerName || 'Customer';
      const custPhone = contObj.mobile || contObj.phone || c.customerPhone || '—';
      const compObj = c.complaintDetail || {};
      const priority = c.priority || compObj.complaintPriority || 'Medium';

      return {
        id: c.callNumber || c.callId || ('#' + c.id),
        customer: custName,
        phone: custPhone,
        productInfo: this.getProductName(pId),
        status: rawStatus,
        priority: priority
      };
    });
  }

  getBrandsPercentage(): number {
    return Math.min(100, (this.summary.brands / 10) * 100) || 0;
  }
  
  getProductsPercentage(): number {
    return Math.min(100, (this.summary.products / 10) * 100) || 0;
  }

  getProductName(id?: any): string {
    if (id === undefined || id === null) return 'Product';
    return this.products.find(p => p.id === id || p.id === Number(id))?.name || `Product #${id}`;
  }

  getStatusClass(status?: string): string {
    if (!status) return 'status-pending';
    const s = status.toUpperCase().replace(/[\s_-]+/g, '');
    if (s === 'PENDING' || s === 'OPEN') return 'status-pending';
    if (s === 'INPROGRESS') return 'status-progress';
    if (s === 'PENDINGFORAPPROVAL' || s === 'PENDINGAPPROVAL') return 'status-approval';
    if (s === 'RESOLVED' || s === 'COMPLETED') return 'status-resolved';
    if (s === 'CLOSED' || s === 'CANCELLED' || s === 'CANCELED') return 'status-closed';
    return 'status-pending';
  }
}
