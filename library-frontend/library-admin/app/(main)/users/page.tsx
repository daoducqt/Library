"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Shield,
  ShieldCheck,
  User as UserIcon,
  Loader2,
  Ban,
  CheckCircle,
  Mail,
  Phone,
} from "lucide-react";
import {
  getUsers,
  getUserById,
  createUser,
  updateUserRoleStatus,
  deleteUser,
} from "@/service/user/userService";
import { User, UserRole, UserStatus, UserPagination } from "@/src/type/user";
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

// Role Badge Component
const RoleBadge = ({ role }: { role: UserRole }) => {
  const roleConfig: Record<
    UserRole,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    SUPER_ADMIN: {
      label: "Super Admin",
      color: "bg-purple-100 text-purple-800",
      icon: <ShieldCheck size={14} />,
    },
    ADMIN: {
      label: "Admin",
      color: "bg-blue-100 text-blue-800",
      icon: <Shield size={14} />,
    },
    USER: {
      label: "Người dùng",
      color: "bg-gray-100 text-gray-800",
      icon: <UserIcon size={14} />,
    },
  };

  const config = roleConfig[role] || {
    label: role || "Không xác định",
    color: "bg-gray-100 text-gray-800",
    icon: <UserIcon size={14} />,
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

// Status Badge Component
const StatusBadge = ({ status }: { status: UserStatus }) => {
  const statusConfig: Record<
    UserStatus,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    ACTIVE: {
      label: "Hoạt động",
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle size={14} />,
    },
    BANNED: {
      label: "Bị khóa",
      color: "bg-red-100 text-red-800",
      icon: <Ban size={14} />,
    },
  };

  const config = statusConfig[status] || {
    label: status || "Không xác định",
    color: "bg-gray-100 text-gray-800",
    icon: <CheckCircle size={14} />,
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<UserPagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<UserStatus | "ALL">("ALL");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state for create user
  const [createForm, setCreateForm] = useState({
    userName: "",
    password: "",
    fullName: "",
    email: "",
    phone: "",
    role: "USER" as UserRole,
  });

  // Form state for edit user (role/status)
  const [editForm, setEditForm] = useState({
    role: "USER" as UserRole,
    status: "ACTIVE" as UserStatus,
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    userCount: 0,
    bannedCount: 0,
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getUsers(currentPage, 10);
      if (response) {
        setUsers(response.data.items);
        setPagination(response.data.pagination);

        // Calculate stats
        const items = response.data.items;
        const allUsers = response.data.pagination.total;
        const admins = items.filter(
          (u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN"
        ).length;
        const normalUsers = items.filter((u) => u.role === "USER").length;
        const banned = items.filter((u) => u.status === "BANNED").length;

        setStats({
          totalUsers: allUsers,
          adminCount: admins,
          userCount: normalUsers,
          bannedCount: banned,
        });
      }
    } catch (error) {
      NotificationExtension.Fails("Lỗi khi tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleViewDetail = async (user: User) => {
    try {
      const detail = await getUserById(user._id);
      if (detail) {
        setSelectedUser(detail);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      NotificationExtension.Fails("Lỗi khi tải thông tin người dùng");
    }
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      role: user.role,
      status: user.status,
    });
    setIsEditModalOpen(true);
  };

  const handleCreateUser = async () => {
    if (!createForm.userName || !createForm.password || !createForm.fullName) {
      NotificationExtension.Fails("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (!createForm.email && !createForm.phone) {
      NotificationExtension.Fails("Vui lòng nhập email hoặc số điện thoại");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await createUser({
        userName: createForm.userName,
        password: createForm.password,
        fullName: createForm.fullName,
        email: createForm.email || undefined,
        phone: createForm.phone || undefined,
        role: createForm.role,
      });

      if (response?.status === 200) {
        NotificationExtension.Success("Tạo người dùng thành công");
        setIsCreateModalOpen(false);
        setCreateForm({
          userName: "",
          password: "",
          fullName: "",
          email: "",
          phone: "",
          role: "USER",
        });
        fetchUsers();
      } else {
        NotificationExtension.Fails(
          response?.message || "Lỗi khi tạo người dùng"
        );
      }
    } catch (error) {
      NotificationExtension.Fails("Lỗi khi tạo người dùng");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateRoleStatus = async () => {
    if (!selectedUser) return;

    setIsProcessing(true);
    try {
      const response = await updateUserRoleStatus(selectedUser._id, {
        role: editForm.role,
        status: editForm.status,
      });

      if (response?.status === 200) {
        NotificationExtension.Success("Cập nhật thành công");
        setIsEditModalOpen(false);
        fetchUsers();
      } else {
        NotificationExtension.Fails(response?.message || "Lỗi khi cập nhật");
      }
    } catch (error) {
      NotificationExtension.Fails("Lỗi khi cập nhật người dùng");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;

    setIsProcessing(true);
    try {
      const response = await deleteUser(userId);
      if (response?.status === 200) {
        NotificationExtension.Success("Xóa người dùng thành công");
        fetchUsers();
      } else {
        NotificationExtension.Fails(
          response?.message || "Lỗi khi xóa người dùng"
        );
      }
    } catch (error) {
      NotificationExtension.Fails("Lỗi khi xóa người dùng");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);

    const matchRole = filterRole === "ALL" || user.role === filterRole;
    const matchStatus = filterStatus === "ALL" || user.status === filterStatus;

    return matchSearch && matchRole && matchStatus;
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-blue-600" />
            Quản lý Người dùng
          </h1>
          <p className="text-gray-500 mt-1">
            Quản lý và theo dõi người dùng trong hệ thống
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Thêm người dùng
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Tổng người dùng"
          value={stats.totalUsers}
          icon={<Users size={24} className="text-blue-600" />}
          color="border-blue-500"
        />
        <StatsCard
          title="Quản trị viên"
          value={stats.adminCount}
          icon={<Shield size={24} className="text-purple-600" />}
          color="border-purple-500"
        />
        <StatsCard
          title="Người dùng thường"
          value={stats.userCount}
          icon={<UserIcon size={24} className="text-gray-600" />}
          color="border-gray-500"
        />
        <StatsCard
          title="Bị khóa"
          value={stats.bannedCount}
          icon={<Ban size={24} className="text-red-600" />}
          color="border-red-500"
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
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as UserRole | "ALL")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">Người dùng</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as UserStatus | "ALL")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="BANNED">Bị khóa</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon size={20} className="text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.fullName}
                          </p>
                          <p className="text-sm text-gray-500">
                            @{user.userName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {user.email && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Mail size={14} />
                            {user.email}
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Phone size={14} />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Hiển thị {(currentPage - 1) * 10 + 1} -{" "}
              {Math.min(currentPage * 10, pagination.total)} trong tổng số{" "}
              {pagination.total} người dùng
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-3 py-1 text-sm">
                Trang {currentPage} / {Math.ceil(pagination.total / 10)}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!pagination.hasNextPage}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết người dùng"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Avatar and Name */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon size={40} className="text-blue-600" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedUser.fullName}
                </h3>
                <p className="text-gray-500">@{selectedUser.userName}</p>
                <div className="flex gap-2 mt-2">
                  <RoleBadge role={selectedUser.role} />
                  <StatusBadge status={selectedUser.status} />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">
                  {selectedUser.email || "Chưa cập nhật"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <p className="font-medium">
                  {selectedUser.phone || "Chưa cập nhật"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Xác thực</p>
                <p className="font-medium">
                  {selectedUser.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Ngày tạo</p>
                <p className="font-medium">
                  {formatDate(selectedUser.createdAt)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenEditModal(selectedUser);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Edit size={18} />
                Chỉnh sửa
              </button>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleDeleteUser(selectedUser._id);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 size={18} />
                Xóa
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm người dùng mới"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={createForm.userName}
              onChange={(e) =>
                setCreateForm({ ...createForm, userName: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Nhập tên đăng nhập"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={createForm.password}
              onChange={(e) =>
                setCreateForm({ ...createForm, password: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Nhập mật khẩu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={createForm.fullName}
              onChange={(e) =>
                setCreateForm({ ...createForm, fullName: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Nhập họ và tên"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={createForm.email}
              onChange={(e) =>
                setCreateForm({ ...createForm, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Nhập email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              type="text"
              value={createForm.phone}
              onChange={(e) =>
                setCreateForm({ ...createForm, phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vai trò <span className="text-red-500">*</span>
            </label>
            <select
              value={createForm.role}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  role: e.target.value as UserRole,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="USER">Người dùng</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <p className="text-sm text-gray-500">
            <span className="text-red-500">*</span> Bắt buộc phải có email hoặc
            số điện thoại
          </p>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleCreateUser}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Plus size={18} />
              )}
              Tạo người dùng
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Chỉnh sửa người dùng"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon size={24} className="text-blue-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {selectedUser.fullName}
                </p>
                <p className="text-sm text-gray-500">
                  @{selectedUser.userName}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vai trò
              </label>
              <select
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({ ...editForm, role: e.target.value as UserRole })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="USER">Người dùng</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    status: e.target.value as UserStatus,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="BANNED">Khóa</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateRoleStatus}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <CheckCircle size={18} />
                )}
                Lưu thay đổi
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
