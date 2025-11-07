export interface PaymentItem {
  title: string;
  unitPrice: number;
  quantity: number;
  tangible: boolean;
}

export interface CustomerDocument {
  number: string;
  type: "cpf" | "cnpj" | "global";
}

export interface Customer {
  name: string;
  email: string;
  phone?: string;
  document: CustomerDocument;
}

export interface PaymentRequest {
  currency: "BRL";
  amount: number;
  items: PaymentItem[];
  customer: Customer;
}

export interface PaymentResponse {
  qrcode: string;
  expirationDate: string;
  id: string;
  status: PaymentStatus;
}

export type PaymentStatus = "PENDING" | "APPROVED" | "EXPIRED";

export interface GatewayPaymentStatus {
  status: PaymentStatus;
  gateway: string;
  qrcode?: string;
  gatewayPaymentId: string;
}

export interface GatewayPaymentData extends PaymentRequest {
  id: string;
  expirationDate: Date;
}

export interface GatewayPaymentResult {
  qrcode: string;
  gatewayPaymentId: string;
  expirationDate: Date;
  gateway: string;
}

export interface StoredPayment {
  id: string;
  gateway: string;
  originalData: PaymentRequest;
  result: GatewayPaymentResult;
  createdAt: Date;
  status: PaymentStatus;
}

export interface GatewayConfig {
  apiUrl?: string;
  enabled?: boolean;
  [key: string]: any;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ApiError {
  error: string;
  message: string;
  details?: ValidationError[];
}

// PayEvo specific types
export interface PayEvoItem {
  title: string;
  unitPrice: number;
  quantity: number;
  externalRef?: string;
}

export interface PayEvoCustomerDocument {
  number: string;
  type: "CPF" | "CNPJ";
}

export interface PayEvoCustomer {
  name: string;
  email: string;
  phone: string;
  document: PayEvoCustomerDocument;
}

export interface PayEvoPix {
  expiresInDays: number;
}

export interface PayEvoTransactionRequest {
  postbackUrl: string;
  items: PayEvoItem[];
  customer: PayEvoCustomer;
  paymentMethod: "PIX";
  pix: PayEvoPix;
  amount: number;
}

export interface PayEvoPixResponse {
  qrcode: string;
  expirationDate: string;
  end2EndId: string | null;
  receiptUrl: string | null;
}

export interface PayEvoTransactionResponse {
  id: string;
  amount: number;
  refundedAmount: number;
  companyId: string;
  installments: number;
  paymentMethod: string;
  status: string;
  postbackUrl: string | null;
  metadata: string;
  traceable: boolean;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  ip: string;
  externalRef: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    birthdate: string | null;
    createdAt: string;
    document: PayEvoCustomerDocument;
    address: {
      street: string;
      streetNumber: string;
      complement: string;
      zipCode: string;
      neighborhood: string;
      city: string;
      state: string;
      country: string;
    };
  };
  card: any;
  boleto: any;
  pix: PayEvoPixResponse;
  shipping: {
    street: string;
    streetNumber: string;
    complement: string;
    zipCode: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
  };
  refusedReason: string | null;
  items: Array<{
    title: string;
    quantity: number;
  }>;
  splits: Array<{
    recipientId: string;
    netAmount: number;
  }>;
  fee: {
    fixedAmount: number;
    spreadPercentage: number;
    estimatedFee: number;
    netAmount: number;
  };
}

// BlackCat specific types
export interface TransactionItem {
  title: string;
  unitPrice: number;
  quantity: number;
  tangible: boolean;
  externalRef: string;
}

export interface BlackCatCustomerDocument {
  number: string;
  type: "cpf" | "cnpj";
}

export interface CustomerTransaction {
  name: string;
  email: string;
  document: BlackCatCustomerDocument;
}

export interface TransactionPix {
  expiresInDays: number;
}

export interface TransactionRequest {
  postbackUrl?: string;
  amount: number;
  currency: "BRL";
  paymentMethod: "pix";
  pix: TransactionPix;
  items: TransactionItem[];
  customer: CustomerTransaction;
}

export interface BlackCatPaymentRequest {
  postbackUrl?: string;
  amount: number;
  currency: "BRL";
  paymentMethod: "pix";
  pix: TransactionPix;
  items: TransactionItem[];
  customer: CustomerTransaction;
}
export interface BlackCatPixResponse {
  qrcode: string;
  expirationDate: string;
  end2EndId: string;
  receiptUrl: string;
}

export interface BlackCatTransactionResponse {
  id: number;
  status: "pending" | "paid" | "refunded" | "refused";
  pix: BlackCatPixResponse;
}
