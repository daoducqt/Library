import { repositoryApi } from "@/src/api/repositories/Repository";
import { RegisterRequest } from "@/src/type/register";

export const userApi = {
  register(data: RegisterRequest) {
    return repositoryApi.post("/user/register", data);
  },
};
