import { repositoryApi } from "@/src/api/repositories/Repository";
import { ApiResponseLoan } from "@/type/book";

export const borrowBooks = async (bookId: string, days: number) => {
  const res = await repositoryApi.post(
    "/loan/borrow",
    { bookId, days },
    { withCredentials: true }
  );
  return res;
};