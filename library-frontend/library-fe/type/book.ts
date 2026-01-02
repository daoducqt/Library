
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
  available: boolean;
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


export interface BookDetailTopBooks {
  author: string;
  coverURL: string;
  availableCopies: number;
  description: string;
  publishedYear: number;
  title: string;
  totalCopies: number;
  views:number;  
}
export interface BookIndataTopBooks {
  bookDetails: BookDetailTopBooks;
  bookId: string;
  id: string;
  title: string;
  borrowCount: number;
  lastBorrowDate: string;

}

export interface dataTopBook{
  books:BookIndataTopBooks[];
  endDate:string;
  startDate:string;
  period:string;
  totalBooks:number;
}
export interface getTopbook{
  data:dataTopBook;
  message:string;
  status:number;
}

export interface BorrowData {
  _id: string;
  bookId: string;
  userId: string;
  borrowDate: string;   // ISO date
  dueDate: string;      // ISO date
  createdAt: string;    // ISO date
  updatedAt: string;    // ISO date
  status: "BORROWED" | "RETURNED" | string;
  extendCount: number;
  __v: number;
}
export interface BorrowResponse {
  status: number;
  message: string;
  data: BorrowData;
}

// Interface for borrowed book with full details
export interface BorrowedBook {
  _id: string;
  userId: string;
  book: {
    _id: string;
    title: string;
    author: string;
    coverUrl?: string;
    availableCopies?: number;
    totalCopies?: number;
  };
  status: "PENDING" | "BORROWED" | "RETURNED" | "OVERDUE";
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  extendCount: number;
  extendHistory: Array<{
    extendedAt: string;
    previousDueDate: string;
    newDueDate: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface BorrowedBooksResponse {
  status: number;
  message: string;
  data: BorrowedBook[];
}

