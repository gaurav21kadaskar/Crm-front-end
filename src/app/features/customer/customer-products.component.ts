import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { BrandService } from '../../core/services/brand.service';
import { environment } from '../../../environments/environment';

interface ProductDisplay {
  id: number;
  name: string;
  productCode?: string;
  description?: string;
  brandId: number;
  brandName: string;
  image?: string | null;
}

@Component({
  selector: 'app-customer-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cp-page animate-fade-in">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>Products</h1>
          <p>Explore our complete range of available products and specifications</p>
        </div>
        <div class="header-stats">
          <div class="stat-pill">
            <span class="stat-num">{{ products.length }}</span>
            <span class="stat-lbl">Products</span>
          </div>
          <div class="stat-pill">
            <span class="stat-num">{{ brands.length }}</span>
            <span class="stat-lbl">Brands</span>
          </div>
        </div>
      </div>

      <!-- Filter Controls Bar -->
      <div class="filter-card">
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" class="form-control search-input" placeholder="Search by name, code, or description..."
                 [(ngModel)]="searchQuery" (input)="applyFilters()" />
        </div>

        <div class="brand-filter-group">
          <label class="filter-label" for="brandSelect">Filter Brand:</label>
          <select id="brandSelect" class="form-control brand-select" [(ngModel)]="selectedBrand" (change)="applyFilters()">
            <option value="">All Brands</option>
            @for (b of brands; track b.id) {
              <option [value]="b.id">{{ b.name }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading) {
        <div class="state-container">
          <div class="spinner"></div>
          <p class="state-text">Loading catalog products...</p>
        </div>
      }

      <!-- Empty State -->
      @if (!loading && filteredProducts.length === 0) {
        <div class="state-container">
          <div class="empty-icon">📦</div>
          <h3>No products match your criteria</h3>
          <p class="state-sub">Try searching for something else or clear the brand filter.</p>
        </div>
      }

      <!-- Product Cards Grid -->
      @if (!loading && filteredProducts.length > 0) {
        <div class="product-grid">
          @for (product of filteredProducts; track product.id) {
            <div class="product-card" (click)="openDetail(product)">
              <div class="card-image-wrap">
                @if (product.image) {
                  <img [src]="getImageUrl(product.image)" [alt]="product.name" class="product-img" (error)="onImgError($event)" />
                } @else {
                  <div class="no-img-placeholder">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>No Image</span>
                  </div>
                }
                <span class="brand-badge">{{ product.brandName }}</span>
              </div>

              <div class="card-body">
                <div class="card-title-row">
                  <h3 class="product-title">{{ product.name }}</h3>
                  @if (product.productCode) {
                    <span class="code-badge">{{ product.productCode }}</span>
                  }
                </div>

                <p class="product-desc">
                  {{ product.description || 'No description provided for this product.' }}
                </p>

                <div class="card-footer">
                  <button class="view-details-btn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <span>View Specifications</span>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Modal Detail View -->
      @if (selectedProduct) {
        <div class="modal-backdrop animate-fade-in" (click)="closeDetail()">
          <div class="modal-card animate-slide-up" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <h3 class="modal-title">{{ selectedProduct.name }}</h3>
                <span class="modal-subtitle">{{ selectedProduct.brandName }}</span>
              </div>
              <button class="modal-close" (click)="closeDetail()">&times;</button>
            </div>

            <div class="modal-body">
              <div class="modal-image-box">
                @if (selectedProduct.image) {
                  <img [src]="getImageUrl(selectedProduct.image)" [alt]="selectedProduct.name" class="modal-product-img" />
                } @else {
                  <div class="no-img-placeholder large">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>No Image Available</span>
                  </div>
                }
              </div>

              <div class="spec-grid">
                <div class="spec-item">
                  <span class="spec-label">Product ID</span>
                  <span class="spec-val text-mono">#{{ selectedProduct.id }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Brand</span>
                  <span class="spec-val highlight">{{ selectedProduct.brandName }}</span>
                </div>
                @if (selectedProduct.productCode) {
                  <div class="spec-item span-2">
                    <span class="spec-label">Product Code</span>
                    <span class="spec-val text-mono">{{ selectedProduct.productCode }}</span>
                  </div>
                }
                <div class="spec-item span-2">
                  <span class="spec-label">Description</span>
                  <p class="spec-desc">{{ selectedProduct.description || 'No description available for this product.' }}</p>
                </div>
              </div>

              <div class="readonly-banner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>This view is read-only. Contact Administrator to update product details.</span>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeDetail()">Close</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cp-page {
      max-width: 1300px;
      margin: 0 auto;
    }

    /* Page Header */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-header h1 {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
    }

    .page-header p {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0.25rem 0 0 0;
    }

    .header-stats {
      display: flex;
      gap: 0.75rem;
    }

    .stat-pill {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 0.5rem 1.25rem;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    .stat-num {
      font-size: 1.3rem;
      font-weight: 800;
      color: var(--primary);
      line-height: 1.1;
    }

    .stat-lbl {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Filter Card */
    .filter-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.25rem;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 240px;
    }

    .search-icon {
      position: absolute;
      left: 0.85rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }

    .search-input {
      padding-left: 2.5rem;
    }

    .brand-filter-group {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .filter-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      white-space: nowrap;
    }

    .brand-select {
      min-width: 180px;
      padding: 0.55rem 2rem 0.55rem 0.85rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      background-color: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius);
      cursor: pointer;
    }


    /* States */
    .state-container {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 4rem 2rem;
      text-align: center;
      box-shadow: var(--shadow-sm);
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem auto;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .state-text {
      color: var(--text-secondary);
      font-weight: 500;
      margin: 0;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 0.75rem;
    }

    .state-container h3 {
      font-size: 1.1rem;
      color: var(--text-primary);
      margin: 0 0 0.25rem 0;
    }

    .state-sub {
      color: var(--text-muted);
      font-size: 0.875rem;
      margin: 0;
    }

    /* Grid & Cards */
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .product-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      cursor: pointer;
      display: flex;
      flex-direction: column;
    }

    .product-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
      border-color: var(--primary-light);
    }

    .card-image-wrap {
      position: relative;
      height: 180px;
      background: var(--surface-2);
      border-bottom: 1px solid var(--border-light);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .product-card:hover .product-img {
      transform: scale(1.04);
    }

    .no-img-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      color: var(--text-muted);
      font-size: 0.78rem;
      font-weight: 500;
    }

    .no-img-placeholder.large {
      font-size: 0.85rem;
      gap: 0.6rem;
    }

    .brand-badge {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(6px);
      color: #f8fafc;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.65rem;
      border-radius: 9999px;
      letter-spacing: 0.03em;
    }

    body.dark-theme .brand-badge {
      background: rgba(30, 41, 59, 0.85);
      border: 1px solid rgba(255,255,255,0.1);
    }

    .card-body {
      padding: 1.15rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .card-title-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .product-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.3;
    }

    .code-badge {
      font-family: monospace;
      font-size: 0.72rem;
      font-weight: 600;
      background: var(--surface-2);
      border: 1px solid var(--border);
      padding: 0.15rem 0.45rem;
      border-radius: 6px;
      color: var(--text-secondary);
      flex-shrink: 0;
    }

    .product-desc {
      font-size: 0.825rem;
      color: var(--text-secondary);
      line-height: 1.5;
      margin: 0 0 1rem 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }

    .card-footer {
      border-top: 1px dashed var(--border);
      padding-top: 0.75rem;
      display: flex;
      justify-content: flex-end;
    }

    .view-details-btn {
      background: none;
      border: none;
      color: var(--primary);
      font-size: 0.8rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      cursor: pointer;
      padding: 0;
      transition: gap 0.2s;
    }

    .product-card:hover .view-details-btn {
      color: var(--primary-dark);
      gap: 0.5rem;
    }

    /* Modal Backdrop & Content */
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-card {
      background: var(--surface);
      border-radius: var(--radius-xl);
      border: 1px solid var(--border);
      width: 100%;
      max-width: 520px;
      box-shadow: var(--shadow-xl);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      max-height: 90vh;
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--surface-2);
    }

    .modal-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
    }

    .modal-subtitle {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--text-muted);
      cursor: pointer;
      line-height: 1;
      padding: 0;
    }

    .modal-close:hover { color: var(--text-primary); }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .modal-image-box {
      width: 100%;
      height: 220px;
      border-radius: var(--radius-lg);
      background: var(--surface-2);
      border: 1px solid var(--border);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-product-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .spec-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
    }

    .spec-item {
      background: var(--surface-2);
      border: 1px solid var(--border-light);
      border-radius: var(--radius);
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .spec-item.span-2 {
      grid-column: span 2;
    }

    .spec-label {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .spec-val {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .spec-val.highlight {
      color: var(--primary);
    }

    .spec-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.5;
      white-space: pre-wrap;
    }

    .readonly-banner {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: var(--radius);
      padding: 0.75rem 1rem;
      color: #b45309;
      font-size: 0.8rem;
      font-weight: 600;
    }

    body.dark-theme .readonly-banner {
      background: rgba(245, 158, 11, 0.12);
      color: #fbbf24;
      border-color: rgba(245, 158, 11, 0.2);
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      background: var(--surface-2);
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class CustomerProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private brandService = inject(BrandService);

  readonly apiUrl = environment.apiUrl;

  products: ProductDisplay[] = [];
  brands: any[] = [];
  filteredProducts: ProductDisplay[] = [];
  selectedProduct: ProductDisplay | null = null;
  searchQuery = '';
  selectedBrand: number | string = '';
  loading = true;

  ngOnInit(): void {
    this.loadAllData();
  }

  private parseArray(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.results)) return res.results;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  }

  loadAllData(): void {
    this.loading = true;
    this.brandService.getBrands().subscribe({
      next: (res: any) => {
        this.brands = this.parseArray(res);
        this.fetchProducts();
      },
      error: () => {
        this.brands = [
          { id: 1, name: 'Samsung' },
          { id: 2, name: 'LG' },
          { id: 3, name: 'Whirlpool' }
        ];
        this.fetchProducts();
      }
    });
  }

  fetchProducts(): void {
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        const raw: any[] = this.parseArray(res);
        this.products = raw.map(p => this.normalize(p));
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.products = [
          { id: 1, name: 'Air Conditioner', brandId: 1, brandName: 'Samsung', productCode: 'AC-SAM-101', description: 'Split AC with WindFree cooling technology, silent operation, and inverter energy efficiency.' },
          { id: 2, name: 'Washing Machine', brandId: 2, brandName: 'LG', productCode: 'WM-LG-204', description: 'Front load 8kg washing machine with AI Direct Drive and Steam Wash system.' },
          { id: 3, name: 'Refrigerator 340L', brandId: 1, brandName: 'Samsung', productCode: 'RF-SAM-302', description: 'Double door frost-free refrigerator with Convertible 5in1 modes.' },
          { id: 4, name: 'Convection Oven 30L', brandId: 3, brandName: 'Whirlpool', productCode: 'MW-WHP-401', description: 'Countertop convection microwave with 25 auto cook menus.' }
        ];
        this.applyFilters();
        this.loading = false;
      }
    });
  }

  normalize(p: any): ProductDisplay {
    const bId = p.brand || p.brandId;
    const foundBrand = this.brands.find(b => b.id === Number(bId));
    const img = p.productImage || p.image || p.product_image || null;

    return {
      id: p.id,
      name: p.name || 'Untitled Product',
      productCode: p.productCode || p.product_code || '',
      description: p.description || '',
      brandId: Number(bId),
      brandName: foundBrand ? foundBrand.name : 'Brand',
      image: img
    };
  }

  getImageUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return `${this.apiUrl}${cleanPath}`;
  }

  onImgError(event: Event): void {
    const imgEl = event.target as HTMLImageElement;
    imgEl.style.display = 'none';
  }

  setBrand(brandId: number | string): void {
    this.selectedBrand = brandId;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.products];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.productCode && p.productCode.toLowerCase().includes(q)) ||
        p.brandName.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (this.selectedBrand !== '') {
      result = result.filter(p => p.brandId === Number(this.selectedBrand));
    }

    this.filteredProducts = result;
  }

  openDetail(p: ProductDisplay): void {
    this.selectedProduct = p;
  }

  closeDetail(): void {
    this.selectedProduct = null;
  }
}
