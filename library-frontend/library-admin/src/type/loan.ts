// Loan Types
export interface LoanUser {
  _id: string;
  userName: string;
  fullName: string;
  email?: string;
  phone?: string;
}

export interface LoanBook {
  _id: string;
  title: string;
  author: string;
  image?: string;
}

export interface ExtendHistory {
  extendedAt: string;
  extraDays: number;
  status: "APPROVED" | "REJECTED";
  reason?: string;
}

export type LoanStatus = "PENDING" | "BORROWED" | "RETURNED" | "OVERDUE" | "CANCELLED";

export interface Loan {
  _id: string;
  userId: LoanUser;
  bookId: LoanBook;
  status: LoanStatus;
  pickCode: string;
  pickupExpiry?: string;
  comfirmedAt?: string;
  comfirmedby?: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  extendCount: number;
  extendHistory: ExtendHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface LoanPagination {
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface GetLoansResponse {
  status: number;
  message: string;
  data: {
    items: Loan[];
    pagination: LoanPagination;
  };
}

export interface GetPendingLoansResponse {
  status: number;
  message: string;
  data: Loan[];
}

export interface LoanDetailResponse {
  status: number;
  message: string;
  data: Loan;
}

export interface LoanStatsResponse {
  status: number;
  message: string;
  data: {
    totalLoans: number;
    pendingLoans: number;
    borrowedLoans: number;
    returnedLoans: number;
    overdueLoans: number;
    cancelledLoans: number;
  };
}

export interface ReturnBookResponse {
  status: number;
  message: string;
  data?: Loan;
}

export interface ConfirmCodeResponse {
  status: number;
  message: string;
  data?: Loan;
}

export interface CheckCodeRequest {
  code: string;
}

export interface CheckCodeResponse {
  status: number;
  message: string;
  data?: Loan;
}
