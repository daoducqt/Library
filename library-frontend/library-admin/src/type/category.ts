// Category Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  isActive: boolean;
  order: number;
  viName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetCategoriesResponse {
  status: number;
  message: string;
  data: Category[];
  pagination: CategoryPagination;
}

export interface CategoryResponse {
  status: number;
  message: string;
  data: Category;
}

export interface CreateCategoryRequest {
  name: string;
  viName?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  viName?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}
