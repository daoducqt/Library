"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Eye,
  RotateCcw,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  AlertTriangle,
  XCircle,
  BookOpen,
  Loader2,
  QrCode,
} from "lucide-react";
import {
  getLoans,
  getBorrowedLoans,
  getOverdueLoans,
  getPendingLoans,
  getLoanDetail,
  returnBook,
  confirmPickupCode,
  checkCode,
  getLoanStats,
} from "@/service/loan/loanService";
import { Loan, LoanStatus, LoanPagination } from "@/src/type/loan";
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

// Status Badge Component
const StatusBadge = ({ status }: { status: LoanStatus }) => {
  const statusConfig: Record<
    LoanStatus,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    PENDING: {
      label: "Chờ xử lý",
      color: "bg-yellow-100 text-yellow-800",
      icon: <Clock size={14} />,
    },
    BORROWED: {
      label: "Đang mượn",
      color: "bg-blue-100 text-blue-800",
      icon: <BookOpen size={14} />,
    },
    RETURNED: {
      label: "Đã trả",
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle size={14} />,
    },
    OVERDUE: {
      label: "Quá hạn",
      color: "bg-red-100 text-red-800",
      icon: <AlertTriangle size={14} />,
    },
    CANCELLED: {
      label: "Đã hủy",
      color: "bg-gray-100 text-gray-800",
      icon: <XCircle size={14} />,
    },
  };

  const config = statusConfig[status] || {
    label: status || "Không xác định",
    color: "bg-gray-100 text-gray-800",
    icon: <Clock size={14} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatsCard = ({ title, value, icon, color }: StatsCardProps) => (
  <div className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div
        className={`p-3 rounded-full bg-opacity-10 ${color.replace(
          "border-",
          "bg-"
        )}`}
      >
        {icon}
      </div>
    </div>
  </div>
);

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [pagination, setPagination] = useState<LoanPagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<LoanStatus | "ALL">("ALL");
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCheckCodeModalOpen, setIsCheckCodeModalOpen] = useState(false);
  const [checkCodeValue, setCheckCodeValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    totalLoans: 0,
    pendingLoans: 0,
    borrowedLoans: 0,
    returnedLoans: 0,
    overdueLoans: 0,
    cancelledLoans: 0,
  });

  const fetchLoans = useCallback(async () => {
    setIsLoading(true);
    try {
      let response;

      if (filterStatus === "ALL") {
        response = await getLoans(currentPage, 10);
      } else if (filterStatus === "BORROWED") {
        response = await getBorrowedLoans(currentPage, 10);
      } else if (filterStatus === "OVERDUE") {
        response = await getOverdueLoans(currentPage, 10);
      } else if (filterStatus === "PENDING") {
        const pendingRes = await getPendingLoans();
        if (pendingRes) {
          setLoans(pendingRes.data || []);
          setPagination(null);
        }
        setIsLoading(false);
        return;
      } else {
        response = await getLoans(currentPage, 10);
      }

      if (response) {
        setLoans(response.data.items);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      NotificationExtension.Fails("Lỗi khi tải danh sách phiếu mượn");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filterStatus]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await getLoanStats();
      if (response?.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
    fetchStats();
  }, [fetchLoans, fetchStats]);

  const handleViewDetail = async (loan: Loan) => {
    try {
      const detail = await getLoanDetail(loan._id);
      if (detail) {
        setSelectedLoan(detail);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      NotificationExtension.Fails("Lỗi khi tải chi tiết phiếu mượn");
    }
  };

  const handleReturnBook = async (loanId: string) => {
    if (!confirm("Xác nhận trả sách?")) return;

    setIsProcessing(true);
    try {
      const response = await returnBook(loanId);
      if (response?.status === 200) {
        NotificationExtension.Success("Trả sách thành công");
        fetchLoans();
        fetchStats();
        setIsDetailModalOpen(false);
      } else {
        NotificationExtension.Fails(response?.message || "Lỗi khi trả sách");
      }
    } catch (error) {
      NotificationExtension.Fails("Lỗi khi trả sách");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPickup = async (loanId: string) => {
    if (!confirm("Xác nhận đã lấy sách?")) return;

    setIsProcessing(true);
    try {
      const response = await confirmPickupCode(loanId);
      if (response?.status === 200) {
        NotificationExtension.Success("Xác nhận lấy sách thành công");
        fetchLoans();
        fetchStats();
        setIsDetailModalOpen(false);
      } else {
        NotificationExtension.Fails(response?.message || "Lỗi khi xác nhận");
      }
    } catch (error) {
      NotificationExtension.Fails("Lỗi khi xác nhận lấy sách");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckCode = async () => {
    if (!checkCodeValue.trim()) {
      NotificationExtension.Fails("Vui lòng nhập mã lấy sách");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await checkCode(checkCodeValue);
      if (response?.status === 200 && response.data) {
        setSelectedLoan(response.data);
        setIsCheckCodeModalOpen(false);
        setIsDetailModalOpen(true);
        setCheckCodeValue("");
        NotificationExtension.Success("Tìm thấy phiếu mượn");
      } else {
        NotificationExtension.Fails(
          response?.message || "Không tìm thấy phiếu mượn"
        );
      }
    } catch (error) {
      NotificationExtension.Fails("Lỗi khi kiểm tra mã");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredLoans = loans.filter((loan) => {
    const matchSearch =
      loan.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.userId?.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.bookId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.pickCode?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "ALL") return matchSearch;
    return matchSearch && loan.status === filterStatus;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="text-blue-600" />
          Quản lý Phiếu mượn
        </h1>
        <p className="text-gray-500 mt-1">
          Quản lý và theo dõi các phiếu mượn sách trong hệ thống
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatsCard
          title="Tổng phiếu"
          value={stats.totalLoans}
          icon={<FileText size={24} className="text-gray-600" />}
          color="border-gray-500"
        />
        <StatsCard
          title="Chờ xử lý"
          value={stats.pendingLoans}
          icon={<Clock size={24} className="text-yellow-600" />}
          color="border-yellow-500"
        />
        <StatsCard
          title="Đang mượn"
          value={stats.borrowedLoans}
          icon={<BookOpen size={24} className="text-blue-600" />}
          color="border-blue-500"
        />
        <StatsCard
          title="Đã trả"
          value={stats.returnedLoans}
          icon={<CheckCircle size={24} className="text-green-600" />}
          color="border-green-500"
        />
        <StatsCard
          title="Quá hạn"
          value={stats.overdueLoans}
          icon={<AlertTriangle size={24} className="text-red-600" />}
          color="border-red-500"
        />
        <StatsCard
          title="Đã hủy"
          value={stats.cancelledLoans}
          icon={<XCircle size={24} className="text-gray-600" />}
          color="border-gray-400"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, sách, mã lấy sách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as LoanStatus | "ALL");
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="BORROWED">Đang mượn</option>
            <option value="RETURNED">Đã trả</option>
            <option value="OVERDUE">Quá hạn</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>

          {/* Check Code Button */}
          <button
            onClick={() => setIsCheckCodeModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <QrCode size={20} />
            Kiểm tra mã
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => {
              fetchLoans();
              fetchStats();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RotateCcw size={20} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="mx-auto text-gray-300" size={60} />
            <p className="mt-4 text-gray-500">Không có phiếu mượn nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Người mượn
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sách
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Mã lấy sách
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ngày mượn
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hạn trả
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLoans.map((loan) => (
                  <tr
                    key={loan._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {loan.userId?.fullName || loan.userId?.userName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {loan.userId?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {loan.bookId?.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {loan.bookId?.author}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {loan.pickCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(loan.borrowDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(loan.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={loan.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(loan)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        {loan.status === "PENDING" && (
                          <button
                            onClick={() => handleConfirmPickup(loan._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Xác nhận lấy sách"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {(loan.status === "BORROWED" ||
                          loan.status === "OVERDUE") && (
                          <button
                            onClick={() => handleReturnBook(loan._id)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Xác nhận trả sách"
                          >
                            <RotateCcw size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total > pagination.limit && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              trên {pagination.total} phiếu mượn
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="px-4 py-2 text-sm font-medium">
                Trang {pagination.page}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!pagination.hasNextPage}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết phiếu mượn"
      >
        {selectedLoan && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Trạng thái:</span>
              <StatusBadge status={selectedLoan.status} />
            </div>

            {/* Loan Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Mã lấy sách</p>
                <p className="font-mono text-lg font-semibold">
                  {selectedLoan.pickCode}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số lần gia hạn</p>
                <p className="font-semibold">{selectedLoan.extendCount}/1</p>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                Thông tin người mượn
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-500">Họ tên:</span>{" "}
                  {selectedLoan.userId?.fullName ||
                    selectedLoan.userId?.userName}
                </p>
                <p>
                  <span className="text-gray-500">Email:</span>{" "}
                  {selectedLoan.userId?.email}
                </p>
                <p>
                  <span className="text-gray-500">SĐT:</span>{" "}
                  {selectedLoan.userId?.phone || "Chưa cập nhật"}
                </p>
              </div>
            </div>

            {/* Book Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                Thông tin sách
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-500">Tên sách:</span>{" "}
                  {selectedLoan.bookId?.title}
                </p>
                <p>
                  <span className="text-gray-500">Tác giả:</span>{" "}
                  {selectedLoan.bookId?.author}
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Ngày mượn</p>
                <p className="font-medium">
                  {formatDate(selectedLoan.borrowDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Hạn trả</p>
                <p className="font-medium">
                  {formatDate(selectedLoan.dueDate)}
                </p>
              </div>
              {selectedLoan.returnDate && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Ngày trả</p>
                    <p className="font-medium">
                      {formatDate(selectedLoan.returnDate)}
                    </p>
                  </div>
                </>
              )}
              {selectedLoan.comfirmedAt && (
                <div>
                  <p className="text-sm text-gray-500">Ngày xác nhận lấy</p>
                  <p className="font-medium">
                    {formatDate(selectedLoan.comfirmedAt)}
                  </p>
                </div>
              )}
            </div>

            {/* Extend History */}
            {selectedLoan.extendHistory &&
              selectedLoan.extendHistory.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Lịch sử gia hạn
                  </h4>
                  <div className="space-y-2">
                    {selectedLoan.extendHistory.map((ext, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>
                          {formatDate(ext.extendedAt)} - {ext.extraDays} ngày
                        </span>
                        <span
                          className={
                            ext.status === "APPROVED"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {ext.status === "APPROVED" ? "Đã duyệt" : "Từ chối"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              {selectedLoan.status === "PENDING" && (
                <button
                  onClick={() => handleConfirmPickup(selectedLoan._id)}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <CheckCircle size={20} />
                  )}
                  Xác nhận lấy sách
                </button>
              )}
              {(selectedLoan.status === "BORROWED" ||
                selectedLoan.status === "OVERDUE") && (
                <button
                  onClick={() => handleReturnBook(selectedLoan._id)}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <RotateCcw size={20} />
                  )}
                  Xác nhận trả sách
                </button>
              )}
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Check Code Modal */}
      <Modal
        isOpen={isCheckCodeModalOpen}
        onClose={() => {
          setIsCheckCodeModalOpen(false);
          setCheckCodeValue("");
        }}
        title="Kiểm tra mã lấy sách"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Nhập mã lấy sách để tìm kiếm phiếu mượn tương ứng
          </p>
          <input
            type="text"
            placeholder="Nhập mã lấy sách..."
            value={checkCodeValue}
            onChange={(e) => setCheckCodeValue(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono text-lg text-center uppercase"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={handleCheckCode}
              disabled={isProcessing || !checkCodeValue.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Search size={20} />
              )}
              Kiểm tra
            </button>
            <button
              onClick={() => {
                setIsCheckCodeModalOpen(false);
                setCheckCodeValue("");
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
