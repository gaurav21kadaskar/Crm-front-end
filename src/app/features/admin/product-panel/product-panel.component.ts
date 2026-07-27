import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandFormComponent } from './brand-form/brand-form.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { ProductModelFormComponent } from './product-model-form/product-model-form.component';
import { ProductIssueFormComponent } from './product-issue-form/product-issue-form.component';

type TabId = 'brand' | 'product' | 'model' | 'issue';

@Component({
  selector: 'app-product-panel',
  standalone: true,
  imports: [CommonModule, BrandFormComponent, ProductFormComponent, ProductModelFormComponent, ProductIssueFormComponent],
  template: `
    <div class="panel-wrapper">
      <div class="panel-header">
        <h2 class="panel-title">Product Management</h2>
        <p class="panel-subtitle">Create and manage Brands, Products, Models, and Issues</p>
      </div>

      <!-- Tab Navigation -->
      <div class="tab-nav">
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'brand'"
          (click)="activeTab = 'brand'"
          id="tab-brand"
        >
          <span class="tab-icon">🏷️</span>
          Brand
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'product'"
          (click)="activeTab = 'product'"
          id="tab-product"
        >
          <span class="tab-icon">📦</span>
          Product
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'model'"
          (click)="activeTab = 'model'"
          id="tab-model"
        >
          <span class="tab-icon">🔧</span>
          Product Model
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'issue'"
          (click)="activeTab = 'issue'"
          id="tab-issue"
        >
          <span class="tab-icon">⚠️</span>
          Product Issue
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        @if (activeTab === 'brand') {
          <app-brand-form />
        }
        @if (activeTab === 'product') {
          <app-product-form />
        }
        @if (activeTab === 'model') {
          <app-product-model-form />
        }
        @if (activeTab === 'issue') {
          <app-product-issue-form />
        }
      </div>
    </div>
  `,
  styles: [`
    .panel-wrapper {
      max-width: 720px;
      margin: 2rem auto;
      padding: 0 1rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    .panel-header {
      margin-bottom: 2rem;
    }

    .panel-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.375rem 0;
    }

    .panel-subtitle {
      font-size: 0.95rem;
      color: #64748b;
      margin: 0;
    }

    /* Tab Navigation */
    .tab-nav {
      display: flex;
      gap: 0;
      border-bottom: 2px solid #e2e8f0;
      margin-bottom: 1.75rem;
      overflow-x: auto;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      font-size: 0.9rem;
      font-weight: 500;
      color: #64748b;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      cursor: pointer;
      white-space: nowrap;
      transition: color 0.2s, border-color 0.2s;
    }

    .tab-btn:hover {
      color: #0f172a;
    }

    .tab-btn.active {
      color: #2563eb;
      border-bottom-color: #2563eb;
    }

    .tab-icon {
      font-size: 1rem;
    }

    /* Form Shared Styles (overrides for children) */
    .tab-content :ng-deep .form-container {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }

    .tab-content :ng-deep textarea.pro-input {
      resize: vertical;
      font-family: inherit;
    }

    .tab-content :ng-deep select.pro-input {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      padding-right: 2.5rem;
      cursor: pointer;
    }
  `]
})
export class AdminProductPanelComponent {
  activeTab: TabId = 'brand';
}
