import { repositoryApi } from "@/src/api/repositories/Repository";
import {
  GetCategoriesResponse,
  Category,
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/src/type/category";

// Lấy danh sách danh mục với phân trang
export const getCategories = async (
  page: number = 1,
  limit: number = 10
): Promise<GetCategoriesResponse | null> => {
  const res = await repositoryApi.get<GetCategoriesResponse>(
    `/category?page=${page}&limit=${limit}`
  );
  return res;
};

// Lấy chi tiết danh mục
export const getCategoryDetail = async (id: string): Promise<Category | undefined> => {
  const res = await repositoryApi.get<CategoryResponse>(`/category/${id}`);
  return res?.data;
};

// Tạo danh mục mới
export const createCategory = async (
  data: CreateCategoryRequest
): Promise<Category | undefined> => {
  const res = await repositoryApi.post<CategoryResponse>("/category/create", data);
  return res?.data;
};

// Cập nhật danh mục
export const updateCategory = async (
  id: string,
  data: UpdateCategoryRequest
): Promise<Category | undefined> => {
  const res = await repositoryApi.put<CategoryResponse>(`/category/update/${id}`, data);
  return res?.data;
};

// Xóa danh mục
export const deleteCategory = async (id: string): Promise<boolean> => {
  const res = await repositoryApi.delete<CategoryResponse>(`/category/delete/${id}`);
  return res !== null;
};
