import { repositoryApi } from "@/src/api/repositories/Repository";
import { ApiResponseDetail , BookDetails } from "@/type/book";
export const getDetails = async (id: string): Promise<BookDetails | undefined> => {
  const res = await repositoryApi.get<ApiResponseDetail>(`/book/detailBook/${id}`);
  return res?.data; 
};