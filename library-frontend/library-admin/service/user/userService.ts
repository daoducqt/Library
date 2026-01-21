import { repositoryApi } from "@/src/api/repositories/Repository";
import {
  GetUsersResponse,
  GetUserByIdResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateRoleStatusRequest,
  UpdateRoleStatusResponse,
  DeleteUserResponse,
  User,
} from "@/src/type/user";

// Lấy danh sách tất cả users
export const getUsers = async (
  page: number = 1,
  limit: number = 10
): Promise<GetUsersResponse | null> => {
  const res = await repositoryApi.get<GetUsersResponse>(
    `/user?page=${page}&limit=${limit}`
  );
  return res;
};

// Lấy chi tiết một user theo ID
export const getUserById = async (userId: string): Promise<User | undefined> => {
  const res = await repositoryApi.get<GetUserByIdResponse>(`/user/${userId}`);
  return res?.data;
};

// Tạo user mới (Admin)
export const createUser = async (
  userData: CreateUserRequest
): Promise<CreateUserResponse | null> => {
  const res = await repositoryApi.post<CreateUserResponse>(`/user/create`, userData);
  return res;
};

// Cập nhật role/status user (Admin)
export const updateUserRoleStatus = async (
  userId: string,
  data: UpdateRoleStatusRequest
): Promise<UpdateRoleStatusResponse | null> => {
  const res = await repositoryApi.patch<UpdateRoleStatusResponse>(
    `/user/update-role-status/${userId}`,
    data
  );
  return res;
};

// Xóa user (Admin)
export const deleteUser = async (userId: string): Promise<DeleteUserResponse | null> => {
  const res = await repositoryApi.delete<DeleteUserResponse>(`/user/delete/${userId}`);
  return res;
};
