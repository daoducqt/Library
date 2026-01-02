import { repositoryApi } from "@/src/api/repositories/Repository";
import { ApiResponseLoan, BorrowResponse } from "@/type/book";

export const borrowBooks = async (
  bookId: string,
  days: number
): Promise<BorrowResponse | null> => {
  const res = await repositoryApi.post<BorrowResponse>(
    "/loan/borrow",
    { bookId, days },
    { withCredentials: true }
  );

  return res; // ✅ KHÔNG .data
};