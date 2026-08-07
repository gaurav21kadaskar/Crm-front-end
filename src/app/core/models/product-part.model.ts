export interface ProductPart {
  id?: number;
  product: number; // Product ID
  name: string;
  description?: string;
  isActive?: boolean;
  is_active?: boolean;
  partImage?: string | null;
  part_image?: string | null;
  createdDate?: string;
  updatedDate?: string;
}
