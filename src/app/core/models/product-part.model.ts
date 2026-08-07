export interface ProductPart {
  id?: number;
  product: number; // Product ID
  name: string;
  description?: string;
  isActive?: boolean;
  partImage?: string | null;
  createdDate?: string;
  updatedDate?: string;
}
