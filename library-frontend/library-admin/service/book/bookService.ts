import { repositoryApi } from "@/src/api/repositories/Repository";
import {
  GetBooksResponse,
  Book,
  BookResponse,
  CreateBookRequest,
  UpdateBookRequest,
  CategoryListResponse,
  Category,
} from "@/src/type/book";

// Lấy danh sách sách với phân trang
export const getBooks = async (
  page: number = 1,
  limit: number = 10
): Promise<GetBooksResponse | null> => {
  const res = await repositoryApi.get<GetBooksResponse>(
    `/book/getBookList?page=${page}&limit=${limit}`
  );
  return res;
};

// Lấy chi tiết sách
export const getBookDetail = async (id: string): Promise<Book | undefined> => {
  const res = await repositoryApi.get<BookResponse>(`/book/detail/${id}`);
  return res?.data;
};

// Tạo sách mới
export const createBook = async (
  data: CreateBookRequest
): Promise<Book | undefined> => {
  const res = await repositoryApi.post<BookResponse>("/book/create", data);
  return res?.data;
};

// Cập nhật sách
export const updateBook = async (
  id: string,
  data: UpdateBookRequest
): Promise<Book | undefined> => {
  const res = await repositoryApi.patch<BookResponse>(`/book/update/${id}`, data);
  return res?.data;
};

// Upload ảnh sách
export const uploadBookImage = async (
  id: string,
  file: File
): Promise<Book | undefined> => {
  const formData = new FormData();
  formData.append("image", file);
  
  const res = await repositoryApi.put<BookResponse>(
    `/book/upload-image/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res?.data;
};

// Vô hiệu hóa sách
export const disableBook = async (id: string): Promise<Book | undefined> => {
  const res = await repositoryApi.patch<BookResponse>(`/book/disable/${id}`);
  return res?.data;
};

// Bật sách
export const enableBook = async (id: string): Promise<Book | undefined> => {
  const res = await repositoryApi.patch<BookResponse>(`/book/enable/${id}`);
  return res?.data;
};

// Lấy danh sách danh mục
export const getCategories = async (
  page: number = 1,
  limit: number = 100
): Promise<Category[] | undefined> => {
  const res = await repositoryApi.get<CategoryListResponse>(
    `/category?page=${page}&limit=${limit}&isActive=true`
  );
  return res?.data;
};
