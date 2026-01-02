import { repositoryApi } from "@/src/api/repositories/Repository";
import { ApiResponse, Books, GetBooksResponse, getTopbook } from "@/type/book";
export const getTopBooks = async (
     limit: number, period: string
): Promise<getTopbook | null> => {

  const res = await repositoryApi.get<getTopbook>(`/loan/top10-borrowed?period=${period}&limit=${limit}`);
  return res;
};
