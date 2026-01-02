export interface User {
  _id: string;
  userName: string;
  email: string;
  fullName: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
  isVerified: boolean;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  __v: number;
}

export interface ApiResponseUser {
  status: number;
  message?: string;
  data: User;
}