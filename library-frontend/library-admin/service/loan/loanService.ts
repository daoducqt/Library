import { repositoryApi } from "@/src/api/repositories/Repository";
import {
  GetLoansResponse,
  GetPendingLoansResponse,
  LoanDetailResponse,
  LoanStatsResponse,
  ReturnBookResponse,
  ConfirmCodeResponse,
  CheckCodeResponse,
  Loan,
} from "@/src/type/loan";

// Lấy danh sách tất cả loans (admin)
export const getLoans = async (
  page: number = 1,
  limit: number = 10
): Promise<GetLoansResponse | null> => {
  const res = await repositoryApi.get<GetLoansResponse>(
    `/loan/list?page=${page}&limit=${limit}`
  );
  return res;
};

// Lấy danh sách loans đang mượn (BORROWED)
export const getBorrowedLoans = async (
  page: number = 1,
  limit: number = 10
): Promise<GetLoansResponse | null> => {
  const res = await repositoryApi.get<GetLoansResponse>(
    `/loan/borrowed?page=${page}&limit=${limit}`
  );
  return res;
};

// Lấy danh sách loans quá hạn (OVERDUE)
export const getOverdueLoans = async (
  page: number = 1,
  limit: number = 10
): Promise<GetLoansResponse | null> => {
  const res = await repositoryApi.get<GetLoansResponse>(
    `/loan/overdue?page=${page}&limit=${limit}`
  );
  return res;
};

// Lấy danh sách yêu cầu mượn đang chờ (PENDING)
export const getPendingLoans = async (): Promise<GetPendingLoansResponse | null> => {
  const res = await repositoryApi.get<GetPendingLoansResponse>(`/loan/pendinglist`);
  return res;
};

// Lấy chi tiết một loan
export const getLoanDetail = async (loanId: string): Promise<Loan | undefined> => {
  const res = await repositoryApi.get<LoanDetailResponse>(`/loan/${loanId}`);
  return res?.data;
};

// Lấy chi tiết một pending loan
export const getPendingLoanDetail = async (loanId: string): Promise<Loan | undefined> => {
  const res = await repositoryApi.get<LoanDetailResponse>(`/loan/pending-detail/${loanId}`);
  return res?.data;
};

// Thống kê loans
export const getLoanStats = async (): Promise<LoanStatsResponse | null> => {
  const res = await repositoryApi.get<LoanStatsResponse>(`/loan/stats`);
  return res;
};

// Trả sách
export const returnBook = async (loanId: string): Promise<ReturnBookResponse | null> => {
  const res = await repositoryApi.post<ReturnBookResponse>(`/loan/${loanId}/return`);
  return res;
};

// Xác nhận mã lấy sách
export const confirmPickupCode = async (loanId: string): Promise<ConfirmCodeResponse | null> => {
  const res = await repositoryApi.post<ConfirmCodeResponse>(`/loan/confirm-code/${loanId}/`);
  return res;
};

// Kiểm tra mã lấy sách
export const checkCode = async (pickupCode: string): Promise<CheckCodeResponse | null> => {
  const res = await repositoryApi.post<CheckCodeResponse>(`/loan/check-code`, { pickupCode });
  return res;
};

// Tìm kiếm user pending
export const searchUserPending = async (search: string): Promise<GetPendingLoansResponse | null> => {
  const res = await repositoryApi.get<GetPendingLoansResponse>(
    `/loan/pending-search?search=${encodeURIComponent(search)}`
  );
  return res;
};
