export interface ProductModel {
  id?: number;
  product: number; // Product ID
  modelName: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
