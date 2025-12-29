import { repositoryApi } from "@/src/api/repositories/Repository";
import { ApiResponse, Books, GetBooksResponse } from "@/type/book";

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}
export const getListBooks = async (
  params: PaginationParams = {}
): Promise<GetBooksResponse | null> => {
  const { page = 1, limit = 20, search = "" } = params;
  let url = `/book/getBookList?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  const res = await repositoryApi.get<GetBooksResponse>(url);
  return res;
};
