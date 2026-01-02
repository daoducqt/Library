"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Book,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import {
  getBooks,
  createBook,
  updateBook,
  uploadBookImage,
  disableBook,
  enableBook,
  getCategories,
} from "@/service/book/bookService";
import {
  Book as BookType,
  Category,
  CreateBookRequest,
  UpdateBookRequest,
  BookPagination,
} from "@/src/type/book";
import { NotificationExtension } from "@/src/component/extension/notification";

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-xl">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

// Book Form Component
interface BookFormProps {
  initialData?: BookType;
  categories: Category[];
  onSubmit: (data: CreateBookRequest | UpdateBookRequest) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const BookForm = ({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isLoading,
}: BookFormProps) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    author: initialData?.author || "",
    description: initialData?.description || "",
    publishedYear: initialData?.publishedYear || new Date().getFullYear(),
    totalCopies: initialData?.totalCopies || 1,
    availableCopies: initialData?.availableCopies || 1,
    categoryId: initialData?.categoryId?._id || "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "publishedYear" ||
        name === "totalCopies" ||
        name === "availableCopies"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="Nhập tiêu đề sách"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tác giả <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="author"
          value={formData.author}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="Nhập tên tác giả"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
          placeholder="Nhập mô tả sách"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Năm xuất bản <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="publishedYear"
            value={formData.publishedYear}
            onChange={handleChange}
            required
            min={1000}
            max={new Date().getFullYear()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">Chọn danh mục</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.viName || category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tổng số bản <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="totalCopies"
            value={formData.totalCopies}
            onChange={handleChange}
            required
            min={0}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số bản có sẵn <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="availableCopies"
            value={formData.availableCopies}
            onChange={handleChange}
            required
            min={0}
            max={formData.totalCopies}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          {initialData ? "Cập nhật" : "Thêm mới"}
        </button>
      </div>
    </form>
  );
};

// Upload Image Modal
interface UploadImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookType | null;
  onUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}

const UploadImageModal = ({
  isOpen,
  onClose,
  book,
  onUpload,
  isLoading,
}: UploadImageModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(selectedFile);
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload ảnh bìa sách">
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Upload ảnh bìa cho sách: <strong>{book?.title}</strong>
          </p>
        </div>

        <div className="flex flex-col items-center">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-48 h-64 object-cover rounded-lg shadow-md"
              />
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="w-48 h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
              <ImageIcon size={48} className="text-gray-400 mb-2" />
              <span className="text-gray-500 text-sm">Chọn ảnh</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            Upload
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default function BooksPage() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<BookPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getBooks(currentPage, limit);
      if (res) {
        setBooks(res.data);
        setPagination(res.pagination);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategories();
      if (res) {
        setCategories(res);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [fetchBooks, fetchCategories]);

  // Handlers
  const handleCreateBook = async (
    data: CreateBookRequest | UpdateBookRequest
  ) => {
    try {
      setActionLoading(true);
      const result = await createBook(data as CreateBookRequest);
      if (result) {
        NotificationExtension.Success("Thêm sách thành công!");
        setIsCreateModalOpen(false);
        fetchBooks();
      }
    } catch (error) {
      console.error("Error creating book:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateBook = async (
    data: CreateBookRequest | UpdateBookRequest
  ) => {
    if (!selectedBook) return;
    try {
      setActionLoading(true);
      const result = await updateBook(
        selectedBook._id,
        data as UpdateBookRequest
      );
      if (result) {
        NotificationExtension.Success("Cập nhật sách thành công!");
        setIsEditModalOpen(false);
        setSelectedBook(null);
        fetchBooks();
      }
    } catch (error) {
      console.error("Error updating book:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadImage = async (file: File) => {
    if (!selectedBook) return;
    try {
      setActionLoading(true);
      const result = await uploadBookImage(selectedBook._id, file);
      if (result) {
        NotificationExtension.Success("Upload ảnh thành công!");
        setIsUploadModalOpen(false);
        setSelectedBook(null);
        fetchBooks();
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (book: BookType) => {
    try {
      setActionLoading(true);
      const result = book.available
        ? await disableBook(book._id)
        : await enableBook(book._id);
      if (result) {
        NotificationExtension.Success(
          `Đã ${book.available ? "vô hiệu hóa" : "kích hoạt"} sách!`
        );
        fetchBooks();
      }
    } catch (error) {
      console.error("Error toggling book status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter books by search term
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get book cover image
  const getBookCover = (book: BookType): string => {
    if (book.image) {
      return `${process.env.NEXT_PUBLIC_API_URL}/${book.image}`;
    }
    if (book.coverUrl) {
      return book.coverUrl;
    }
    if (book.coverId) {
      return `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`;
    }
    return "/placeholder-book.png";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sách</h1>
          <p className="text-gray-500 mt-1">
            Quản lý danh sách sách trong thư viện
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Thêm sách mới
        </button>
      </div>

      {/* Search & Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề hoặc tác giả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Book size={18} className="text-blue-600" />
              <span>
                Tổng: <strong>{pagination?.total || 0}</strong> sách
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-4 font-semibold text-gray-600">
                  Sách
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-600">
                  Danh mục
                </th>
                <th className="text-center py-4 px-4 font-semibold text-gray-600">
                  Số lượng
                </th>
                <th className="text-center py-4 px-4 font-semibold text-gray-600">
                  Trạng thái
                </th>
                <th className="text-center py-4 px-4 font-semibold text-gray-600">
                  Lượt xem
                </th>
                <th className="text-center py-4 px-4 font-semibold text-gray-600">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    <Book size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>Không tìm thấy sách nào</p>
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr
                    key={book._id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getBookCover(book)}
                          alt={book.title}
                          className="w-12 h-16 object-cover rounded-lg shadow-sm bg-gray-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder-book.png";
                          }}
                        />
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">
                            {book.title}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {book.author}
                          </p>
                          <p className="text-xs text-gray-400">
                            {book.publishedYear}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {book.categoryId?.viName ||
                          book.categoryId?.name ||
                          "Chưa phân loại"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="text-sm">
                        <span className="text-green-600 font-medium">
                          {book.availableCopies}
                        </span>
                        <span className="text-gray-400"> / </span>
                        <span className="text-gray-600">
                          {book.totalCopies}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          book.available
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {book.available ? "Có sẵn" : "Không có sẵn"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">
                      {book.views?.toLocaleString() || 0}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedBook(book);
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBook(book);
                            setIsUploadModalOpen(true);
                          }}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Upload ảnh"
                        >
                          <Upload size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(book)}
                          disabled={actionLoading}
                          className={`p-2 rounded-lg transition-colors ${
                            book.available
                              ? "text-orange-600 hover:bg-orange-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={book.available ? "Vô hiệu hóa" : "Kích hoạt"}
                        >
                          {book.available ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Hiển thị {(currentPage - 1) * limit + 1} -{" "}
              {Math.min(currentPage * limit, pagination.total)} trong{" "}
              {pagination.total} sách
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={!pagination.hasPrevPage}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!pagination.hasNextPage}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm sách mới"
      >
        <BookForm
          categories={categories}
          onSubmit={handleCreateBook}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={actionLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBook(null);
        }}
        title="Chỉnh sửa sách"
      >
        {selectedBook && (
          <BookForm
            initialData={selectedBook}
            categories={categories}
            onSubmit={handleUpdateBook}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedBook(null);
            }}
            isLoading={actionLoading}
          />
        )}
      </Modal>

      {/* Upload Image Modal */}
      <UploadImageModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedBook(null);
        }}
        book={selectedBook}
        onUpload={handleUploadImage}
        isLoading={actionLoading}
      />
    </div>
  );
}
