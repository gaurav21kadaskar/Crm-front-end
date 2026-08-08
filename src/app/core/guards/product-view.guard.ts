import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Allows Admin (full CRUD), Customer (view-only) and Distributor (view-only)
 * roles to access product panel pages: Brands, Products, Models, Issues, Parts.
 * Edit/Delete is hidden at component level for non-Admin roles.
 */
export const productViewGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const role = authService.getRole();
  if (role === 'Admin' || role === 'Customer' || role === 'Distributor') {
    return true;
  }

  return router.parseUrl('/dashboard');
};
