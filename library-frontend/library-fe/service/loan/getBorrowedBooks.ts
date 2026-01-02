import { repositoryApi } from "@/src/api/repositories/Repository";
import { BorrowedBooksResponse } from "@/type/book";

export const getBorrowedBooks = async (): Promise<BorrowedBooksResponse | null> => {
  try {
    const res = await repositoryApi.get<BorrowedBooksResponse>(
      "/loan/active",
      { withCredentials: true }
    );
    return res;
  } catch (error) {
    console.error("Error fetching borrowed books:", error);
    return null;
  }
};
