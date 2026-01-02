// src/api/Repository.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import axiosClient from "../axiosClient";
import { NotificationExtension } from "@/src/component/extension/notification";


// helper kiểm tra chuỗi rỗng
const isNullOrEmpty = (s?: string | null): boolean => !s || s.trim() === "";

// base abstract class
export abstract class RepositoryBase {
  public axios: AxiosInstance;

  constructor(baseURL?: string) {
    const envUrl = baseURL ?? process.env.NEXT_PUBLIC_API_URL;
    if (isNullOrEmpty(envUrl)) {
      throw new Error("Lỗi: baseURL chưa được cấu hình (NEXT_PUBLIC_API_URL).");
    }

    // tạo instance riêng cho repository (copy cấu hình axiosClient)
    this.axios = axios.create({
      ...axiosClient.defaults,
      baseURL: envUrl,
    });

    // interceptor thêm token từ localStorage
    // this.axios.interceptors.request.use((config) => {
    //   if (typeof window !== "undefined") {
    //     const token = localStorage.getItem("accessToken")?.replace(/"/g, "");
    //     if (token && config.url !== "/user/login") {
    //       config.headers = config.headers ?? {};
    //       config.headers.Authorization = `Bearer ${token}`;
    //     }
    //   }
    //   return config;
    // });
  }

  // --- CRUD cơ bản ---

  public async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T | null> {

    try {
      const res: AxiosResponse<T> = await this.axios.get<T>(url, config);
      return res.data;
    } catch (err: unknown) {
      await this.handleError(err);
      return null;
    }
  }

  public async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T | null> {
    
    try {
      const res: AxiosResponse<T> = await this.axios.post<T>(url, data, config);
      return res.data;
    } catch (err: unknown) {
      await this.handleError(err);
      return null;
    }
  }

  public async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T | null> {
    
    try {
      const res: AxiosResponse<T> = await this.axios.put<T>(url, data, config);
      return res.data;
    } catch (err: unknown) {
      await this.handleError(err);
      return null;
    }
  }

  public async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T | null> {
    
    try {
      const res: AxiosResponse<T> = await this.axios.patch<T>(url, data, config);
      return res.data;
    } catch (err: unknown) {
      await this.handleError(err);
      return null;
    }
  }

  public async delete<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T | null> {
    
    try {
      const deleteConfig: AxiosRequestConfig = { ...config, data };
      const res: AxiosResponse<T> = await this.axios.delete<T>(url, deleteConfig);
      return res.data;
    } catch (err: unknown) {
      await this.handleError(err);
      return null;
    }
  }

  // --- Xử lý lỗi tập trung ---
  private async handleError(error: unknown): Promise<void> {
    // Kiểm tra xem error có phải từ axios không
    if (!axios.isAxiosError(error)) {
      NotificationExtension.Fails("Lỗi không xác định!");
      return;
    }

    // Network error (ví dụ: server down)
    if (error.code === "ERR_NETWORK" || !error.response) {
      NotificationExtension.Fails("Máy chủ không thể kết nối!");
      return;
    }

    const status = error.response?.status;
    const message =
      (error.response?.data as { message?: string })?.message ?? "";

    switch (status) {
      case 400:
        NotificationExtension.Fails(message || "Yêu cầu không hợp lệ!");
        break;
    //  case 401:
  NotificationExtension.Fails("Phiên đăng nhập thất bại hoặc token hết hạn!");

  if (typeof window !== "undefined") {
    const isLoginPage = window.location.pathname.startsWith("/login");

    // chỉ redirect nếu KHÔNG phải trang login
    if (!isLoginPage) {
      localStorage.removeItem("accessToken");
      window.location.href = `/auth/login?callback=${window.location.pathname}`;
    }
  }
  break;
      case 404:
        NotificationExtension.Fails(message || "Tài nguyên không tồn tại!");
        break;
      case 415:
        NotificationExtension.Fails("Dữ liệu không hợp lệ!");
        break;
      case 500:
        NotificationExtension.Fails(message || "Lỗi máy chủ, vui lòng thử lại!");
        break;
      default:
        NotificationExtension.Fails(message || "Có lỗi xảy ra, vui lòng thử lại!");
        break;
    }
  }
}

// --- Repository toàn cục (nếu muốn dùng chung) ---
export const repositoryApi = new (class extends RepositoryBase {
  // có thể thêm method toàn cục tại đây
})();
