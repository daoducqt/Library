// src/api/user.api.ts
import { repositoryApi } from "@/src/api/repositories/Repository";
import { LoginResponse } from "@/type/login";


export const userApi = {
  login(data: { account: string; password: string }) {
    return repositoryApi.post<LoginResponse>("/user/login", data);
  },
};
