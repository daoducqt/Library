
export interface Author {
  key: string;
  name: string;
}

export interface Availability {
  status: string;
  available_to_borrow: boolean;
  available_to_browse: boolean;
  available_to_waitlist: boolean;
  is_browsable: boolean;
  is_previewable: boolean;
  is_printdisabled: boolean;
  is_readable: boolean;
  is_lendable: boolean;
  is_restricted: boolean;
  identifier?: string;
  isbn?: string;
  openlibrary_edition?: string;
  openlibrary_work?: string;
}

export interface Books {
  _id: string;
  coverUrl : string;
  key: string;
  title: string;
  edition_count: number;
  cover_id?: number;
  cover_edition_key?: string;
  first_publish_year?: number;
  has_fulltext?: boolean;
  ia?: string;
  lending_edition?: string;
  lending_identifier?: string;
  printdisabled?: boolean;
  public_scan?: boolean;
  authors?: Author[];
  availability?: Availability;
  ia_collection?: string[];
  subject?: string[];
}

export interface PaginationInfo {
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
  data: Books[];
  pagination: PaginationInfo;
}

export interface BookDetails {
  availableCopies: number;
  coverUrl: string;
  title: string;
  authors: Author[];
  first_publish_year: number;
  number_of_pages_median: number;
  subjects: string[];
  publishers: string[];
  isbn: string[];
  cover_id: number;
  description: string;
  language: string[];
  type: "borrow" | "online";
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}
export interface ApiResponse {
  status: number;
  message?: string;
  data: Books[];
  pagination?: Pagination;
}

export interface ApiResponseDetail {
  status: number;
  message?: string;
  data: BookDetails;
  pagination?: Pagination;
}

export interface BorrowRecord {
  _id: string;
  userId: string;
  bookId: string;
  status: "BORROWED" | "RETURNED" | "OVERDUE";
  borrowDate: string;
  dueDate: string;
  extendCount: number;
  extendHistory: [];
  createdAt: string;
  updatedAt: string;
}
export interface ApiResponseLoan {
  status: number;
  message?: string;
  data: BorrowRecord;
}
