export interface User {
  _id: string;
  userName: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface LoginResponse {
  status: number;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface LoginRequest {
  account: string;
  password: string;
}

export interface LoginGoogleResponse {
    url: string;
}