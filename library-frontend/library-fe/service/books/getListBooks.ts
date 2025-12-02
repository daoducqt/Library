import { repositoryApi } from "@/src/api/repositories/Repository";
import { ApiResponse, Books } from "@/type/book";

export const getListBooks = async (): Promise<Books[] | undefined > => {
  const res = await repositoryApi.get<ApiResponse>("/book/getBookList");
  return res?.data; // res.data giờ là Book[] luôn
};