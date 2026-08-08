export interface CustomerDetail {
  title?: string;
  firstName: string;
  lastName?: string;
  address1?: string;
  landmark?: string;
  state?: string;
  district?: string;
  city?: string;
  locality?: string;
  pincode?: number | string;
}

export interface ContactDetail {
  mobile: string;
  email?: string;
  contactPersonName?: string;
  contactPersonMobile?: string;
  language?: string[];
}

export interface DealerDetail {
  dealerName?: string;
  dealerCity?: string;
  dealerMobile?: string;
  dealerEmail?: string;
  invoiceNumber?: string;
  purchaseDate?: string;
}

export interface ProductDetail {
  brand: number;
  client?: string;
  product: number;
  model: number;
  issue?: number;
  unitSerialNumber?: string;
  purchaseDate?: string;
  warranty?: string;
  stockOf?: string;
  purchaseOrderNumber?: string;
}

export interface ComplaintDetail {
  callType?: string;
  complaintPriority?: string;
  callNature?: string;
  visitType?: string;
  lastComplaintNumber?: string;
  complaintDescription?: string;
  specialInstruction?: string;
  promiseDate?: string;
  promiseTime?: string;
  amOrPm?: string;
}

export interface Call {
  id?: number | string;
  callId?: string;
  callNumber?: string;
  user_id?: any;
  user?: any;
  created_by?: any;
  customer_id?: any;
  customer_user_id?: any;
  customerDetail?: CustomerDetail;
  contactDetail?: ContactDetail;
  dealerDetail?: DealerDetail;
  productDetail?: ProductDetail;
  complaintDetail?: ComplaintDetail;
  status?: 'Pending' | 'In Progress' | 'Resolved' | 'Closed' | 'Cancelled' | string;
  callStatus?: string;
  call_status?: string;
  technicianAssigned?: string;
  createdAt?: string;
  updatedAt?: string;

  // Flattened convenience properties
  customerName?: string;
  customerPhone?: string;
  address?: string;
  brand?: any;
  product?: any;
  model?: any;
  issue?: any;
  priority?: string;
  remarks?: string;
  imageUrl?: string;
  image?: string;
}

export interface CallExportFilter {
  startDate?: string;
  endDate?: string;
  status?: string;
  brandId?: number | string;
  priority?: string;
}
