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

        // Clear old brand & brandList to avoid stale data from previous sessions
        localStorage.removeItem('crm_brand_id');
        localStorage.removeItem('crm_brand_list');

        // Extract brandList from login JSON response or response.data
        const rawBrandList = response.brandList ?? response.brand_list ?? response.data?.brandList ?? response.data?.brand_list;
        let brandIds: number[] = [];

        if (Array.isArray(rawBrandList)) {
          brandIds = rawBrandList.map((id: any) => Number(id)).filter((id: number) => !isNaN(id));
        }

        const singleBrandId = response.brandId ?? response.brand_id ?? response.brand ??
                             response.user?.brand_id ?? response.user?.brandId ??
                             response.data?.brand_id ?? response.data?.brandId;

        if (singleBrandId !== null && singleBrandId !== undefined && singleBrandId !== '') {
          const numSingle = Number(singleBrandId);
          if (!isNaN(numSingle) && !brandIds.includes(numSingle)) {
            brandIds.push(numSingle);
          }
        }

        if (brandIds.length > 0) {
          localStorage.setItem('crm_brand_list', JSON.stringify(brandIds));
          localStorage.setItem('crm_brand_id', brandIds[0].toString());
          console.log('✅ Brand List saved from login response:', brandIds);
        } else {
          console.warn('⚠️ Brand List not found in login response. Customer brand filtering will rely on assigned brands.');
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

  updateUserStatus(username: string, status: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/api/updateuser/`, { username, status });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('crm_brand_id');
    localStorage.removeItem('crm_brand_list');
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
    const list = this.getBrandList();
    if (list.length > 0) return list[0];
    const stored = localStorage.getItem('crm_brand_id');
    if (stored !== null && stored !== '' && stored !== 'null' && stored !== 'undefined') {
      const num = Number(stored);
      return isNaN(num) ? null : num;
    }
    return null;
  }

  getBrandList(): number[] {
    const brandSet = new Set<number>();

    // 1. From login response crm_brand_list
    try {
      const stored = localStorage.getItem('crm_brand_list');
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          arr.forEach((id: any) => {
            const num = Number(id);
            if (!isNaN(num)) brandSet.add(num);
          });
        }
      }
    } catch (e) {}

    // 2. From single brand ID if present
    const single = localStorage.getItem('crm_brand_id');
    if (single !== null && single !== '' && single !== 'null' && single !== 'undefined') {
      const num = Number(single);
      if (!isNaN(num)) brandSet.add(num);
    }

    // 3. From known user-brand associations stored in localStorage for current user
    const userId = this.getUserId();
    const username = this.getUsername();
    const userKeys = [userId, userId ? String(userId) : null, username, username ? String(username) : null].filter(Boolean);

    try {
      const knownMap = JSON.parse(localStorage.getItem('crm_user_brand_known') || '{}');
      userKeys.forEach(uKey => {
        const userAssocs = knownMap[uKey!];
        if (Array.isArray(userAssocs)) {
          userAssocs.forEach((id: any) => {
            const num = Number(id);
            if (!isNaN(num)) brandSet.add(num);
          });
        }
      });
    } catch (e) {}

    // 4. Remove any brand explicitly marked as inactive in local status map for this user
    try {
      const statusMap = JSON.parse(localStorage.getItem('crm_user_brand_status_map') || '{}');
      brandSet.forEach(bId => {
        userKeys.forEach(uKey => {
          const key = `${uKey}_${bId}`;
          if (statusMap[key] === false || statusMap[key] === 'false') {
            brandSet.delete(bId);
          }
        });
      });
    } catch (e) {}

    return Array.from(brandSet);
  }

  isBrandAllowed(brandId: number | string): boolean {
    const role = this.getRole();
    if (role && role.toLowerCase() === 'admin') return true;
    const allowed = this.getBrandList();
    if (!allowed || allowed.length === 0) return true;
    return allowed.includes(Number(brandId));
  }
}
