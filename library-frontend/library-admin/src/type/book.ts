// Book Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  viName?: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  publishedYear: number;
  totalCopies: number;
  availableCopies: number;
  available: boolean;
  subjects?: string[];
  coverId?: number;
  views: number;
  categoryId: Category | null;
  openLibraryId?: string;
  editionKeys?: string[];
  image?: string;
  lendingIdentifier?: string;
  isbn?: string[];
  likes?: string[];
  likeCount?: number;
  coverUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetBooksResponse {
  status: number;
  message: string;
  data: Book[];
  pagination: BookPagination;
}

export interface BookResponse {
  status: number;
  message: string;
  data: Book;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  description: string;
  publishedYear: number;
  totalCopies: number;
  availableCopies: number;
  categoryId: string;
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  description?: string;
  publishedYear?: number;
  totalCopies?: number;
  availableCopies?: number;
  categoryId?: string;
  subjects?: string[];
  coverId?: number;
}

// Category Types for dropdown
export interface CategoryListResponse {
  status: number;
  message: string;
  data: Category[];
  pagination: BookPagination;
}
