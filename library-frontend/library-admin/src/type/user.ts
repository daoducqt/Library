// User Types

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";
export type UserStatus = "ACTIVE" | "BANNED";

export interface User {
  _id: string;
  userName: string;
  email?: string;
  phone?: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPagination {
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface GetUsersResponse {
  status: number;
  message: string;
  data: {
    items: User[];
    pagination: UserPagination;
  };
}

export interface GetUserByIdResponse {
  status: number;
  message: string;
  data: User;
}

export interface CreateUserRequest {
  userName: string;
  password: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: UserRole;
}

export interface CreateUserResponse {
  status: number;
  message: string;
  data: User;
}

export interface UpdateRoleStatusRequest {
  role?: UserRole;
  status?: UserStatus;
}

export interface UpdateRoleStatusResponse {
  status: number;
  message: string;
  data: User;
}

export interface DeleteUserResponse {
  status: number;
  message: string;
}
