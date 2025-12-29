import { repositoryApi } from "@/src/api/repositories/Repository";

import { ApiResponseUser, User } from "@/type/user";
export const getDetails = async (id: string): Promise<User | undefined> => {
  const res = await repositoryApi.get<ApiResponseUser>(`/user/${id}`);
  return res?.data; 
};