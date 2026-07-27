export interface ProductIssue {
  id?: number;
  product: number; // Product ID
  issueName: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
