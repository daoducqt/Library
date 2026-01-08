// Fine Types
export interface FineUser {
  _id: string;
  name: string;
  email: string;
}

export interface FineLoan {
  _id: string;
  bookId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
}

export type PaymentMethod = "CASH" | "QR_CODE" | null;

export interface Fine {
  _id: string;
  userId: FineUser;
  loanId: FineLoan;
  daysLate: number;
  amount: number;
  isPayed: boolean;
  paidAt?: string;
  paymentMethod: PaymentMethod;
  adminNote: string;
  vnpayOrderId?: string;
  vnpayTransactionNo?: string;
  vnpayReponseCode?: string;
  vnpayBankCode?: string;
  zalopayTransId?: string;
  zalopayTransactionNo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetFinesResponse {
  status: number;
  message: string;
  data: Fine[];
}

export interface FineResponse {
  status: number;
  message: string;
  data: Fine;
}

export interface ConfirmPayRequest {
  note?: string;
}

export interface ConfirmPayResponse {
  status: number;
  message: string;
  data: Fine;
}
