import { Brand } from './brand.model';

export interface Product {
  id?: number;
  brand: number; // Brand ID
  name: string;
  productCode?: string;
  product_code?: string;
  description?: string;
  isActive?: boolean;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  productImage?: string | File | null;
  product_image?: string | File | null;
}
