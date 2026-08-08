export interface ProductPart {
  id?: number;
  product: number;
  name: string;
  partImage?: string | File | null;
  description?: string;
  isActive?: boolean;
  createdDate?: string;
  updatedDate?: string;
}
