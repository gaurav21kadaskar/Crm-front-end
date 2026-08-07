import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';
import { productViewGuard } from './core/guards/product-view.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'create-user',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        // Admin & Customer can access product panel pages
        // Admin: full CRUD; Customer: view-only (enforced in component)
        path: 'admin/brands',
        canActivate: [productViewGuard],
        loadComponent: () => import('./features/admin/product-panel/brand-form/brand-form.component').then(m => m.BrandFormComponent)
      },
      {
        path: 'admin/products',
        canActivate: [productViewGuard],
        loadComponent: () => import('./features/admin/product-panel/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'admin/models',
        canActivate: [productViewGuard],
        loadComponent: () => import('./features/admin/product-panel/product-model-form/product-model-form.component').then(m => m.ProductModelFormComponent)
      },
      {
        path: 'admin/issues',
        canActivate: [productViewGuard],
        loadComponent: () => import('./features/admin/product-panel/product-issue-form/product-issue-form.component').then(m => m.ProductIssueFormComponent)
      },
      {
        path: 'admin/parts',
        canActivate: [productViewGuard],
        loadComponent: () => import('./features/admin/product-panel/product-part-form/product-part-form.component').then(m => m.ProductPartFormComponent)
      },
      {
        // Admin & Distributor can access call management (no extra guard; role filtering is inside the component)
        path: 'calls',
        loadComponent: () => import('./features/calls/call-management.component').then(m => m.CallManagementComponent)
      },
      {
        path: 'customer/products',
        loadComponent: () => import('./features/customer/customer-products.component').then(m => m.CustomerProductsComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
