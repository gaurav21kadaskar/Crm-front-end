import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule],
  template: `
    <div class="dashboard-container animate-fade-in">

      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <div class="welcome-banner-left">
          <div class="welcome-avatar">{{ getInitial() }}</div>
          <div class="welcome-text">
            <h2 class="welcome-heading">Welcome back, <span class="welcome-name">{{ authService.getUsername() }}</span>! 👋</h2>
            <p class="welcome-sub">Here is what's happening with your service calls and products today.</p>
          </div>
        </div>
        <div class="welcome-right">
          <span class="role-chip">{{ authService.getRole() }}</span>
          <button class="refresh-dash-btn" (click)="manualRefresh()" [disabled]="refreshing" title="Refresh Dashboard">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" [class.spinning]="refreshing"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            {{ refreshing ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <!-- Non-Customer Stats Grid -->
      @if (authService.getRole() !== 'Customer') {
        <div class="stats-grid">
          <div class="stat-card stat-card--purple">
            <div class="stat-icon-wrap calls-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div class="stat-details">
              <span class="stat-label">TOTAL CALLS</span>
              <span class="stat-value">{{ stats.totalCalls }}</span>
              <span class="stat-subtext">All registered cases</span>
            </div>
          </div>

          <div class="stat-card stat-card--amber">
            <div class="stat-icon-wrap pending-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="stat-details">
              <span class="stat-label">PENDING CALLS</span>
              <span class="stat-value">{{ stats.pendingCalls }}</span>
              <span class="stat-subtext">Awaiting action</span>
            </div>
          </div>

          <div class="stat-card stat-card--blue">
            <div class="stat-icon-wrap progress-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <div class="stat-details">
              <span class="stat-label">IN PROGRESS</span>
              <span class="stat-value">{{ stats.inProgressCalls }}</span>
              <span class="stat-subtext">Active updates</span>
            </div>
          </div>

          <div class="stat-card stat-card--green">
            <div class="stat-icon-wrap resolved-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div class="stat-details">
              <span class="stat-label">RESOLVED CALLS</span>
              <span class="stat-value">{{ stats.resolvedCalls }}</span>
              <span class="stat-subtext">Closed &amp; resolved</span>
            </div>
          </div>
        </div>
      }

      <!-- Customer Stats Grid -->
      @if (authService.getRole() === 'Customer') {
        <div class="stats-grid">
          <div class="stat-card stat-card--purple">
            <div class="stat-icon-wrap calls-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            </div>
            <div class="stat-details">
              <span class="stat-label">TOTAL BRANDS</span>
              <span class="stat-value">{{ catalogStats.brands }}</span>
              <span class="stat-subtext">Active partner brands</span>
            </div>
          </div>

          <div class="stat-card stat-card--amber">
            <div class="stat-icon-wrap pending-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <div class="stat-details">
              <span class="stat-label">TOTAL PRODUCTS</span>
              <span class="stat-value">{{ catalogStats.products }}</span>
              <span class="stat-subtext">Catalogued items</span>
            </div>
          </div>

          <div class="stat-card stat-card--blue">
            <div class="stat-icon-wrap progress-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <div class="stat-details">
              <span class="stat-label">PRODUCT MODELS</span>
              <span class="stat-value">{{ catalogStats.models }}</span>
              <span class="stat-subtext">Registered model variants</span>
            </div>
          </div>

          <div class="stat-card stat-card--green">
            <div class="stat-icon-wrap resolved-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
            <div class="stat-details">
              <span class="stat-label">PRODUCT PARTS</span>
              <span class="stat-value">{{ catalogStats.parts }}</span>
              <span class="stat-subtext">Spare parts mapped</span>
            </div>
          </div>
        </div>
      }

      <!-- Non-Customer Dashboard Content Grid -->
      @if (authService.getRole() !== 'Customer') {
        <div class="dashboard-content-grid" [class.grid-full]="authService.getRole() === 'Distributor'">
          <div class="recent-calls-section card">
            <div class="section-header">
              <div>
                <h3>Recent Service Calls</h3>
                <p>Latest updates in customer service</p>
              </div>
              <a href="/calls?tab=list" class="view-all">View All →</a>
            </div>
            
            <div class="table-responsive">
              <table class="calls-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>CUSTOMER</th>
                    <th>PRODUCT INFO</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let call of recentCalls">
                    <td class="call-id-cell">{{ call.id }}</td>
                    <td>{{ call.customer }}</td>
                    <td>{{ call.productInfo }}</td>
                    <td><span class="status-badge" [ngClass]="getStatusClass(call.status)">{{ call.status }}</span></td>
                  </tr>
                  <tr *ngIf="recentCalls.length === 0">
                    <td colspan="4" class="text-center" style="padding: 2rem; color: var(--text-secondary);">No calls registered yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          @if (authService.getRole() !== 'Distributor') {
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
                <a href="/calls?tab=create" class="qa-btn">+ New Service Call</a>
                <a href="/calls?tab=list" class="qa-btn qa-btn--outline">View My Calls</a>
              </div>
            </div>
          }
        </div>
      }

      <!-- Customer Dashboard Content Grid -->
      @if (authService.getRole() === 'Customer') {
        <div class="dashboard-content-grid grid-full">
          <div class="recent-calls-section card">
            <div class="section-header">
              <div>
                <h3>Latest Products</h3>
                <p>Newly added models and products in catalog</p>
              </div>
              <a href="/admin/products" class="view-all">View All Products →</a>
            </div>
            
            <div class="table-responsive">
              <table class="calls-table">
                <thead>
                  <tr>
                    <th>PRODUCT NAME</th>
                    <th>BRAND</th>
                    <th>PRODUCT CODE</th>
                    <th>DESCRIPTION</th>
                  </tr>
                </thead>
                <tbody>
                  @for (prod of products.slice(0, 5); track prod.id) {
                    <tr>
                      <td class="call-id-cell">{{ prod.name }}</td>
                      <td>{{ getBrandName(prod.brand) }}</td>
                      <td><span style="font-family: monospace; font-size: 0.85rem; background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 4px;">{{ prod.productCode || prod.product_code || '—' }}</span></td>
                      <td style="color: var(--text-secondary);">{{ prod.description || '—' }}</td>
                    </tr>
                  }
                  @if (products.length === 0) {
                    <tr>
                      <td colspan="4" class="text-center" style="padding: 2rem; color: var(--text-secondary);">No products registered yet.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      color: var(--text-primary);
    }

    /* ── Welcome Banner ─────────────────────────── */
    .welcome-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #0f172a;
      border-radius: 16px;
      padding: 1.5rem 2rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
    }

    .welcome-banner::before {
      content: '';
      position: absolute;
      top: -40%;
      right: -5%;
      width: 280px;
      height: 280px;
      background: rgba(255,255,255,0.05);
      border-radius: 50%;
    }

    .welcome-banner::after {
      content: '';
      position: absolute;
      bottom: -60%;
      right: 10%;
      width: 200px;
      height: 200px;
      background: rgba(255,255,255,0.04);
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
      background: rgba(255,255,255,0.2);
      border: 2px solid rgba(255,255,255,0.35);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      font-weight: 800;
      color: #fff;
      flex-shrink: 0;
      backdrop-filter: blur(6px);
    }

    .welcome-text { display: flex; flex-direction: column; }

    .welcome-heading {
      margin: 0 0 0.35rem 0;
      font-size: 1.45rem;
      font-weight: 700;
      color: #fff;
      line-height: 1.2;
    }

    .welcome-name {
      color: #c7d2fe;
    }

    .welcome-sub {
      margin: 0;
      color: rgba(255,255,255,0.75);
      font-size: 0.9rem;
    }

    .welcome-right {
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.6rem;
    }

    .role-chip {
      display: inline-block;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.3);
      color: #fff;
      padding: 0.35rem 1rem;
      border-radius: 2rem;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      backdrop-filter: blur(6px);
    }

    .refresh-dash-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      color: #fff;
      padding: 0.3rem 0.85rem;
      border-radius: 2rem;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      font-family: inherit;
    }
    .refresh-dash-btn:hover { background: rgba(255,255,255,0.25); }
    .refresh-dash-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .refresh-dash-btn svg { flex-shrink: 0; }
    .spinning { animation: spinIcon 1s linear infinite; }
    @keyframes spinIcon { to { transform: rotate(360deg); } }

    /* ── Stats Grid ─────────────────────────────── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    
    .stat-card {
      background: var(--surface);
      border-radius: 14px;
      padding: 1.35rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.1rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(0,0,0,0.08);
    }

    .stat-card--purple { border-left: 3px solid #4f46e5; }
    .stat-card--amber  { border-left: 3px solid #d97706; }
    .stat-card--blue   { border-left: 3px solid #0284c7; }
    .stat-card--green  { border-left: 3px solid #16a34a; }

    .stat-icon-wrap {
      width: 3rem;
      height: 3rem;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .calls-icon   { background: rgba(79,70,229,0.1);  color: #4f46e5; }
    .pending-icon { background: rgba(217,119,6,0.1);  color: #d97706; }
    .progress-icon{ background: rgba(2,132,199,0.1);  color: #0284c7; }
    .resolved-icon{ background: rgba(22,163,74,0.1);  color: #16a34a; }
    
    .stat-details {
      display: flex;
      flex-direction: column;
    }
    
    .stat-label {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-secondary);
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }
    
    .stat-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0.2rem 0;
      line-height: 1;
    }
    
    .stat-subtext {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    /* ── Content Grid ────────────────────────────── */
    .dashboard-content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.25rem;
    }

    .dashboard-content-grid.grid-full {
      grid-template-columns: 1fr;
    }

    .card {
      background: var(--surface);
      border-radius: 14px;
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    
    .section-header h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .section-header p, .active-items {
      margin: 0;
      font-size: 0.82rem;
      color: var(--text-secondary);
    }

    .view-all {
      font-size: 0.82rem;
      color: #4f46e5;
      text-decoration: none;
      font-weight: 600;
      white-space: nowrap;
    }

    /* ── Table ────────────────────────────────────── */
    .table-responsive {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    
    .calls-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 500px;
    }
    
    .calls-table th {
      text-align: left;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-secondary);
      padding-bottom: 0.875rem;
      border-bottom: 1px solid var(--border);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    
    .calls-table td {
      padding: 0.875rem 0;
      font-size: 0.875rem;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border);
    }

    .call-id-cell {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: #4f46e5 !important;
      font-size: 0.82rem !important;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.65rem;
      border-radius: 1rem;
      background: var(--surface-2);
      color: var(--text-secondary);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    
    .status-badge.open {
      background: rgba(2,132,199,0.1);
      color: #0284c7;
    }

    /* ── Summary Card ─────────────────────────────── */
    .summary-item {
      margin-bottom: 1.35rem;
    }
    
    .summary-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .summary-count {
      font-weight: 700;
      color: var(--text-primary);
      font-size: 0.9rem;
    }

    .progress-bar-container {
      height: 6px;
      background-color: var(--surface-2);
      border-radius: 1rem;
      overflow: hidden;
    }
    
    .progress-bar { height: 100%; border-radius: 1rem; }
    .progress-brand   { background: linear-gradient(90deg, #4f46e5, #7c3aed); }
    .progress-product { background: linear-gradient(90deg, #0284c7, #38bdf8); }

    .status-badge.status-pending { background: #fef3c7; color: #92400e; }
    .status-badge.status-progress { background: #dbeafe; color: #1e40af; }
    .status-badge.status-resolved { background: #dcfce7; color: #166534; }
    .status-badge.status-closed { background: #f1f5f9; color: #475569; }

    /* ── Quick Actions ────────────────────────────── */
    .quick-actions {
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border);
    }

    .qa-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--text-secondary);
      margin: 0 0 0.75rem 0;
    }

    .qa-btn {
      display: block;
      width: 100%;
      padding: 0.6rem 1rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: #fff;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 600;
      text-align: center;
      transition: opacity 0.15s;
      box-sizing: border-box;
    }

    .qa-btn:hover { opacity: 0.88; }

    .qa-btn--outline {
      background: transparent;
      color: #4f46e5;
      border: 1.5px solid #4f46e5;
    }

    .qa-btn--outline:hover { background: rgba(79,70,229,0.06); opacity: 1; }

    @media (max-width: 768px) {
      .dashboard-content-grid { grid-template-columns: 1fr; }
      .welcome-banner { flex-direction: column; align-items: flex-start; gap: 1rem; }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private callService = inject(CallService);
  private brandService = inject(BrandService);
  private productService = inject(ProductService);
  private modelService = inject(ProductModelService);
  private partService = inject(ProductPartService);
  private refreshSub?: Subscription;

  refreshing = false;

  stats = {
    totalCalls: 0,
    pendingCalls: 0,
    inProgressCalls: 0,
    resolvedCalls: 0
  };

  catalogStats = {
    brands: 0,
    products: 0,
    models: 0,
    parts: 0
  };
  
  recentCalls: Array<{ id: string; customer: string; productInfo: string; status: string }> = [];

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
    this.loadData();
    // Auto-refresh every 30 seconds
    this.refreshSub = interval(30000).subscribe(() => this.loadData());
  }

  ngOnDestroy() {
    this.refreshSub?.unsubscribe();
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

  getBrandName(brandId?: any): string {
    if (brandId === undefined || brandId === null) return 'N/A';
    const brand = this.brands.find(b => b.id === brandId || b.id === Number(brandId));
    return brand ? brand.name : `Brand #${brandId}`;
  }

  loadData() {
    this.refreshing = true;
    // Load brands
    this.brandService.getBrands().subscribe({
      next: (res: any) => {
        this.brands = this.parseArray(res);
        this.summary.brands = this.brands.length;
        this.catalogStats.brands = this.brands.length;
        this.loadProductsAndCalls();
      },
      error: () => {
        this.brands = [
          { id: 1, name: 'Samsung', description: 'Samsung Electronics' },
          { id: 2, name: 'LG', description: 'LG Home Appliances' }
        ];
        this.summary.brands = this.brands.length;
        this.catalogStats.brands = this.brands.length;
        this.loadProductsAndCalls();
      }
    });
  }

  loadProductsAndCalls() {
    // Load products
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        this.products = this.parseArray(res);
        this.summary.products = this.products.length;
        this.catalogStats.products = this.products.length;
        this.loadModelsAndParts();
      },
      error: () => {
        this.products = [
          { id: 1, name: 'Air Conditioner', brand: 1 },
          { id: 2, name: 'Washing Machine', brand: 2 }
        ];
        this.summary.products = this.products.length;
        this.catalogStats.products = this.products.length;
        this.loadModelsAndParts();
      }
    });
  }

  loadModelsAndParts() {
    // Load models
    this.modelService.getProductModels().subscribe({
      next: (res: any) => {
        const models = this.parseArray(res);
        this.catalogStats.models = models.length;
        this.loadPartsData();
      },
      error: () => {
        this.catalogStats.models = 0;
        this.loadPartsData();
      }
    });
  }

  loadPartsData() {
    // Load parts
    this.partService.getProductParts().subscribe({
      next: (res: any) => {
        const parts = this.parseArray(res);
        this.catalogStats.parts = parts.length;
        
        if (this.authService.getRole() !== 'Customer') {
          this.loadCalls();
        } else {
          this.refreshing = false;
        }
      },
      error: () => {
        this.catalogStats.parts = 0;
        if (this.authService.getRole() !== 'Customer') {
          this.loadCalls();
        } else {
          this.refreshing = false;
        }
      }
    });
  }

  loadCalls() {
    this.callService.getCalls().subscribe({
      next: (res: any) => {
        const rawCalls = this.parseArray(res);
        this.processCalls(rawCalls);
      },
      error: () => {
        // Fallback mockup
        const rawCalls = [
          {
            id: 1,
            callNumber: 'CALL10001',
            status: 'In Progress',
            createdAt: '2026-07-25',
            customerDetail: { firstName: 'Rahul', lastName: 'Sharma' },
            productDetail: { product: 1 }
          },
          {
            id: 2,
            callNumber: 'CALL10002',
            status: 'Pending',
            createdAt: '2026-07-26',
            customerDetail: { firstName: 'Priya', lastName: 'Patel' },
            productDetail: { product: 2 }
          }
        ];
        this.processCalls(rawCalls);
      }
    });
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
    let filteredCalls = rawCalls.map(c => {
      const cNum = c.callNumber || c.callId || (c.id ? '#' + c.id : '');
      const rawId = c.id ? String(c.id) : '';
      const cNumClean = cNum.replace(/^#/, '').trim();
      const rawIdClean = rawId.replace(/^#/, '').trim();

      const override = map[cNum] ||
                       map[cNumClean] ||
                       map[cNum.toLowerCase()] ||
                       map[cNumClean.toLowerCase()] ||
                       (rawId ? map[rawId] : null) ||
                       (rawIdClean ? map[rawIdClean] : null) ||
                       (rawId ? map[rawId.toLowerCase()] : null);

      if (override) {
        return {
          ...c,
          status: override.status || c.status,
          priority: override.priority || c.priority,
          technicianAssigned: override.technicianAssigned || c.technicianAssigned
        };
      }
      return c;
    });

    if (this.authService.getRole() === 'Distributor') {
      const uId = this.authService.getUserId();
      const uName = (this.authService.getUsername() || '').toLowerCase();
      filteredCalls = filteredCalls.filter((c: any) => {
        const callUserId = c.user_id || c.user || c.customer_id || c.created_by || c.customer_user_id;
        if (uId && callUserId && String(callUserId) === String(uId)) {
          return true;
        }
        const cFirstName = (c.customerDetail?.firstName || '').toLowerCase();
        const cLastName = (c.customerDetail?.lastName || '').toLowerCase();
        const cName = (c.customerName || `${cFirstName} ${cLastName}`).toLowerCase();
        const cEmail = (c.contactDetail?.email || c.email || '').toLowerCase();

        if (uName && uName.length > 0 && uName !== 'distributor') {
          const parts = uName.split(/[\s._-]+/).filter(p => p.length > 1);
          const matchesName = parts.some(p => cName.includes(p));
          const matchesEmail = cEmail && parts.some(p => cEmail.includes(p));
          return matchesName || matchesEmail;
        }
        return false;
      });
    }

    // Sort calls by ID / creation desc
    filteredCalls.sort((a, b) => {
      const aId = Number(a.id) || 0;
      const bId = Number(b.id) || 0;
      return bId - aId;
    });

    // Calculate real-time stats
    this.stats.totalCalls = filteredCalls.length;
    const UP = (s: string) => s ? String(s).trim().toUpperCase().replace(/[\s_-]+/g, '') : '';

    this.stats.pendingCalls = filteredCalls.filter(c => {
      const s = UP(c.status);
      return s === 'OPEN' || s === 'PENDING' || s === '';
    }).length;

    this.stats.inProgressCalls = filteredCalls.filter(c => {
      const s = UP(c.status);
      return s === 'INPROGRESS';
    }).length;

    this.stats.resolvedCalls = filteredCalls.filter(c => {
      const s = UP(c.status);
      return s === 'COMPLETED' || s === 'CLOSED' || s === 'RESOLVED' || s === 'CANCELLED' || s === 'CANCELED';
    }).length;

    this.refreshing = false;

    // Recent calls
    this.recentCalls = filteredCalls.slice(0, 5).map(c => {
      const pId = c.productDetail?.product || c.product;
      let rawStatus = c.status || 'Open';
      // Normalize 'OPEN' -> 'Open', 'IN_PROGRESS' -> 'In Progress', 'RESOLVED' -> 'Resolved'
      const up = rawStatus.toUpperCase().replace(/[\s_-]+/g, '');
      if (up === 'OPEN' || up === 'PENDING') rawStatus = 'Open';
      else if (up === 'INPROGRESS') rawStatus = 'In Progress';
      else if (up === 'RESOLVED') rawStatus = 'Resolved';
      else if (up === 'CLOSED') rawStatus = 'Closed';
      else if (up === 'CANCELLED' || up === 'CANCELED') rawStatus = 'Cancelled';

      return {
        id: c.callNumber || c.callId || ('#' + c.id),
        customer: this.getCustomerName(c),
        productInfo: this.getProductName(pId),
        status: rawStatus
      };
    });
  }

  getBrandsPercentage(): number {
    return Math.min(100, (this.summary.brands / 10) * 100) || 0;
  }
  
  getProductsPercentage(): number {
    return Math.min(100, (this.summary.products / 10) * 100) || 0;
  }

  getCustomerName(call: any): string {
    if (!call) return 'N/A';
    let name = call.customerName || '';
    if (call.customerDetail) {
      let fn = call.customerDetail.firstName || '';
      let ln = call.customerDetail.lastName || '';
      if (fn === 'Customer') fn = '';
      if (ln === 'Name' || ln === '.') ln = '';
      const full = `${fn} ${ln}`.trim();
      if (full && full !== 'N/A') name = full;
    }
    if (name.endsWith(' .')) name = name.substring(0, name.length - 2).trim();
    if (name.endsWith(' Name')) {
      name = name.substring(0, name.length - 5).trim();
    }
    if (name && name !== 'N/A') return name;
    return 'Customer';
  }

  getProductName(id?: any): string {
    if (id === undefined || id === null) return 'N/A';
    return this.products.find(p => p.id === id || p.id === Number(id))?.name || `Product #${id}`;
  }

  getStatusClass(status?: string): string {
    if (!status) return 'status-pending';
    const s = status.toUpperCase().replace(/[\s_-]+/g, '');
    if (s === 'PENDING' || s === 'OPEN') return 'status-pending';
    if (s === 'INPROGRESS') return 'status-progress';
    if (s === 'RESOLVED' || s === 'CLOSED' || s === 'COMPLETED') return 'status-resolved';
    if (s === 'CANCELLED' || s === 'CANCELED') return 'status-closed';
    return 'status-pending';
  }
}

