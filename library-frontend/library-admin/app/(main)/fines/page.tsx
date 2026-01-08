"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Eye,
  RotateCcw,
  CheckCircle,
  X,
  CreditCard,
  Clock,
  DollarSign,
  AlertTriangle,
  Loader2,
  FileText,
  Calendar,
  User,
  Banknote,
} from "lucide-react";
import { getAllFines, confirmPayFine } from "@/service/fine/fineService";
import { Fine, PaymentMethod } from "@/src/type/fine";
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

// Payment Status Badge
const PaymentBadge = ({ isPayed }: { isPayed: boolean }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
        isPayed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {isPayed ? (
        <>
          <CheckCircle size={14} />
          Đã thanh toán
        </>
      ) : (
        <>
          <Clock size={14} />
          Chưa thanh toán
        </>
      )}
    </span>
  );
};

// Payment Method Badge
const PaymentMethodBadge = ({ method }: { method: PaymentMethod }) => {
  if (!method) return <span className="text-gray-400">-</span>;

  const config: Record<string, { label: string; color: string }> = {
    CASH: { label: "Tiền mặt", color: "bg-blue-100 text-blue-800" },
    QR_CODE: { label: "QR Code", color: "bg-purple-100 text-purple-800" },
  };

  const cfg = config[method];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}
    >
      {method === "CASH" ? <Banknote size={14} /> : <CreditCard size={14} />}
      {cfg.label}
    </span>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string | number;
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

export default function FinesPage() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PAID" | "UNPAID">(
    "ALL"
  );
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmNote, setConfirmNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchFines = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllFines();
      if (data) {
        setFines(data);
      }
    } catch (error) {
      NotificationExtension.Fails("Lỗi khi tải danh sách tiền phạt");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFines();
  }, [fetchFines]);

  const handleViewDetail = (fine: Fine) => {
    setSelectedFine(fine);
    setIsDetailModalOpen(true);
  };

  const handleOpenConfirmModal = (fine: Fine) => {
    setSelectedFine(fine);
    setConfirmNote("");
    setIsConfirmModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedFine) return;

    setIsProcessing(true);
    try {
      const response = await confirmPayFine(selectedFine._id, confirmNote);
      if (response?.status === 200) {
        NotificationExtension.Success("Xác nhận thanh toán thành công");
        fetchFines();
        setIsConfirmModalOpen(false);
        setIsDetailModalOpen(false);
      } else {
        NotificationExtension.Fails(
          response?.message || "Lỗi khi xác nhận thanh toán"
        );
      }
    } catch (error) {
      NotificationExtension.Fails("Lỗi khi xác nhận thanh toán");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredFines = fines.filter((fine) => {
    const matchSearch =
      fine.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "ALL") return matchSearch;
    if (filterStatus === "PAID") return matchSearch && fine.isPayed;
    return matchSearch && !fine.isPayed;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Calculate stats
  const totalFines = fines.length;
  const paidFines = fines.filter((f) => f.isPayed).length;
  const unpaidFines = fines.filter((f) => !f.isPayed).length;
  const totalAmount = fines.reduce((sum, f) => sum + f.amount, 0);
  const paidAmount = fines
    .filter((f) => f.isPayed)
    .reduce((sum, f) => sum + f.amount, 0);
  const unpaidAmount = fines
    .filter((f) => !f.isPayed)
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="text-blue-600" />
          Quản lý Tiền phạt
        </h1>
        <p className="text-gray-500 mt-1">
          Quản lý và theo dõi các khoản tiền phạt trong hệ thống
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatsCard
          title="Tổng phiếu phạt"
          value={totalFines}
          icon={<FileText size={24} className="text-gray-600" />}
          color="border-gray-500"
        />
        <StatsCard
          title="Đã thanh toán"
          value={paidFines}
          icon={<CheckCircle size={24} className="text-green-600" />}
          color="border-green-500"
        />
        <StatsCard
          title="Chưa thanh toán"
          value={unpaidFines}
          icon={<Clock size={24} className="text-red-600" />}
          color="border-red-500"
        />
        <StatsCard
          title="Tổng tiền"
          value={formatCurrency(totalAmount)}
          icon={<DollarSign size={24} className="text-blue-600" />}
          color="border-blue-500"
        />
        <StatsCard
          title="Đã thu"
          value={formatCurrency(paidAmount)}
          icon={<Banknote size={24} className="text-green-600" />}
          color="border-green-500"
        />
        <StatsCard
          title="Chưa thu"
          value={formatCurrency(unpaidAmount)}
          icon={<AlertTriangle size={24} className="text-orange-600" />}
          color="border-orange-500"
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
              placeholder="Tìm kiếm theo tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as "ALL" | "PAID" | "UNPAID")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="ALL">Tất cả</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="UNPAID">Chưa thanh toán</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchFines}
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
        ) : filteredFines.length === 0 ? (
          <div className="text-center py-20">
            <CreditCard className="mx-auto text-gray-300" size={60} />
            <p className="mt-4 text-gray-500">Không có khoản phạt nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Người bị phạt
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Số ngày trễ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Phương thức
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFines.map((fine) => (
                  <tr
                    key={fine._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {fine.userId?.name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {fine.userId?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                        <AlertTriangle size={16} />
                        {fine.daysLate} ngày
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(fine.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <PaymentBadge isPayed={fine.isPayed} />
                    </td>
                    <td className="px-6 py-4">
                      <PaymentMethodBadge method={fine.paymentMethod} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(fine.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(fine)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        {!fine.isPayed && (
                          <button
                            onClick={() => handleOpenConfirmModal(fine)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Xác nhận thanh toán"
                          >
                            <CheckCircle size={18} />
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
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết khoản phạt"
      >
        {selectedFine && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Trạng thái:</span>
              <PaymentBadge isPayed={selectedFine.isPayed} />
            </div>

            {/* Amount */}
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-sm text-red-600 mb-1">Số tiền phạt</p>
              <p className="text-3xl font-bold text-red-700">
                {formatCurrency(selectedFine.amount)}
              </p>
              <p className="text-sm text-red-500 mt-1">
                ({selectedFine.daysLate} ngày trễ hạn)
              </p>
            </div>

            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <User size={18} />
                Thông tin người bị phạt
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-500">Họ tên:</span>{" "}
                  {selectedFine.userId?.name || "N/A"}
                </p>
                <p>
                  <span className="text-gray-500">Email:</span>{" "}
                  {selectedFine.userId?.email}
                </p>
              </div>
            </div>

            {/* Loan Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText size={18} />
                Thông tin mượn sách
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Ngày mượn</p>
                  <p className="font-medium">
                    {selectedFine.loanId?.borrowDate
                      ? formatDate(selectedFine.loanId.borrowDate)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Hạn trả</p>
                  <p className="font-medium">
                    {selectedFine.loanId?.dueDate
                      ? formatDate(selectedFine.loanId.dueDate)
                      : "N/A"}
                  </p>
                </div>
                {selectedFine.loanId?.returnDate && (
                  <div>
                    <p className="text-gray-500">Ngày trả</p>
                    <p className="font-medium">
                      {formatDate(selectedFine.loanId.returnDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Info (if paid) */}
            {selectedFine.isPayed && (
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle size={18} />
                  Thông tin thanh toán
                </h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-500">Phương thức:</span>{" "}
                    <PaymentMethodBadge method={selectedFine.paymentMethod} />
                  </p>
                  {selectedFine.paidAt && (
                    <p>
                      <span className="text-gray-500">Ngày thanh toán:</span>{" "}
                      {formatDate(selectedFine.paidAt)}
                    </p>
                  )}
                  {selectedFine.adminNote && (
                    <p>
                      <span className="text-gray-500">Ghi chú:</span>{" "}
                      {selectedFine.adminNote}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar size={16} />
              Ngày tạo: {formatDate(selectedFine.createdAt)}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              {!selectedFine.isPayed && (
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenConfirmModal(selectedFine);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Banknote size={20} />
                  Xác nhận thanh toán tiền mặt
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

      {/* Confirm Payment Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Xác nhận thanh toán tiền mặt"
      >
        {selectedFine && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                Bạn đang xác nhận thanh toán tiền mặt cho khoản phạt{" "}
                <span className="font-bold">
                  {formatCurrency(selectedFine.amount)}
                </span>{" "}
                của người dùng{" "}
                <span className="font-bold">
                  {selectedFine.userId?.name || selectedFine.userId?.email}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={confirmNote}
                onChange={(e) => setConfirmNote(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Nhập ghi chú nếu cần..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <CheckCircle size={20} />
                )}
                Xác nhận
              </button>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
