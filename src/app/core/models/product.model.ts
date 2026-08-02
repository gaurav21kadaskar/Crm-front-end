import { Brand } from './brand.model';

export interface Product {
  id?: number;
  brand: number; // Brand ID
  name: string;
  productCode?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  productImage?: string | File | null;
}
