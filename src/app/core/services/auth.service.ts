import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'crm_auth_token';

  // Signals for state management
  private tokenSignal = signal<string | null>(this.getTokenFromStorage());
  
  public isAuthenticated = computed(() => !!this.tokenSignal());
  public currentToken = computed(() => this.tokenSignal());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login/`, credentials).pipe(
      tap((response: any) => {
        // Save token
        const token = response.token || response.access || response.data?.token;
        if (token) {
          this.setToken(token);
        }

        // Save role (comes directly in the login JSON response)
        const role = response.role || response.user?.role || response.data?.role;
        if (role) {
          localStorage.setItem('crm_role', role.toString());
        }

        // Save brandId — backend returns it directly as response.brandId in the login JSON
        // Clear old brand first to avoid stale data from previous sessions
        localStorage.removeItem('crm_brand_id');

        const brandId = response.brandId ?? response.brand_id ?? response.brand ??
                        response.user?.brand_id ?? response.user?.brandId ??
                        response.data?.brand_id ?? response.data?.brandId;

        if (brandId !== null && brandId !== undefined && brandId !== '') {
          localStorage.setItem('crm_brand_id', brandId.toString());
          console.log('✅ Brand ID saved from login response:', brandId);
        } else {
          console.warn('⚠️ Brand ID not found in login response. Customer brand filtering will not work until a brand is assigned in Admin.');
        }
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/register/`, userData);
  }

  getUsers(status?: string): Observable<any> {
    let url = `${this.apiUrl}/api/listuser/`;
    if (status && status !== 'All') {
      url += `?status=${encodeURIComponent(status)}`;
    }
    return this.http.get<any>(url);
  }

  resetPassword(newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/resetpassword/`, { newPassword });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('crm_brand_id');
    localStorage.removeItem('crm_role');
    this.tokenSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  getRole(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        let role = payload.role || payload.user_type || payload.type || payload.user_role;
        if (!role && (payload.isCustomer || payload.is_customer)) role = 'Customer';
        if (!role && (payload.isAdmin || payload.is_admin)) role = 'Admin';
        if (!role && (payload.isDistributor || payload.is_distributor)) role = 'Distributor';
        if (role) {
          const r = String(role).trim().toLowerCase();
          if (r === 'customer') return 'Customer';
          if (r === 'admin') return 'Admin';
          if (r === 'distributor') return 'Distributor';
          return String(role);
        }
      } catch (e) {}
    }
    const storedRole = localStorage.getItem('crm_role');
    if (storedRole) {
      const r = storedRole.trim().toLowerCase();
      if (r === 'customer') return 'Customer';
      if (r === 'admin') return 'Admin';
      if (r === 'distributor') return 'Distributor';
      return storedRole;
    }
    return null;
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || payload.user || payload.email || null;
    } catch (e) {
      return null;
    }
  }

  getUserId(): string | number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || payload.id || payload.sub || payload.userId || null;
    } catch (e) {
      return null;
    }
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.tokenSignal.set(token);
  }

  private getTokenFromStorage(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getBrandId(): number | null {
    const stored = localStorage.getItem('crm_brand_id');
    if (stored !== null && stored !== '' && stored !== 'null' && stored !== 'undefined') {
      const num = Number(stored);
      return isNaN(num) ? null : num;
    }
    return null;
  }
}
