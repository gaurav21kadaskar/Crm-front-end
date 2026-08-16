export interface LoginRequest {
  username: string;
  password?: string;
}

export interface RegisterRequest {
  username: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isAdmin?: boolean;
  isCustomer?: boolean;
  isDistributor?: boolean;
  fromPin?: number;
  toPin?: number;
  brand?: number;
}

export interface AuthResponse {
  status: number;
  message: string;
  token?: string;
  role?: string;
  brandId?: number;
}
