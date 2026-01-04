"use client";

import { useEffect, useState } from "react";
import {
  Book,
  Users,
  BookOpen,
  DollarSign,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  RotateCcw,
  Calendar,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  getDashboardStats,
  getCategoryDistribution,
  getFineStats,
  getPendingStats,
  getRecentActivities,
} from "@/service/dashboard/dashboardService";
import {
  DashboardStats,
  CategoryItem,
  FineStats,
  PendingStats,
  RecentActivities,
} from "@/src/type/dashboard";

// Colors for charts
const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
];

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  bgColor: string;
  iconBgColor: string;
}

const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendUp,
  bgColor,
  iconBgColor,
}: StatCardProps) => (
  <div
    className={`${bgColor} rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {trend && (
          <p
            className={`text-sm mt-2 flex items-center gap-1 ${
              trendUp ? "text-green-600" : "text-red-600"
            }`}
          >
            <TrendingUp className={`w-4 h-4 ${!trendUp && "rotate-180"}`} />
            {trend} so với tháng trước
          </p>
        )}
      </div>
      <div className={`${iconBgColor} p-4 rounded-xl`}>{icon}</div>
    </div>
  </div>
);

// Mini Stat Card Component
interface MiniStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const MiniStatCard = ({ title, value, icon, color }: MiniStatCardProps) => (
  <div className="bg-white rounded-lg p-4 border border-gray-100 flex items-center gap-3">
    <div className={`${color} p-2 rounded-lg`}>{icon}</div>
    <div>
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [fineStats, setFineStats] = useState<FineStats | null>(null);
  const [pendingStats, setPendingStats] = useState<PendingStats | null>(null);
  const [recentActivities, setRecentActivities] =
    useState<RecentActivities | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, categoryData, fineData, pendingData, activitiesData] =
          await Promise.all([
            getDashboardStats(),
            getCategoryDistribution(),
            getFineStats(),
            getPendingStats(),
            getRecentActivities(5),
          ]);

        if (statsData) setStats(statsData);
        if (categoryData) setCategories(categoryData);
        if (fineData) setFineStats(fineData);
        if (pendingData) setPendingStats(pendingData);
        if (activitiesData) setRecentActivities(activitiesData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Prepare data for fine stats bar chart
  const fineChartData = fineStats
    ? [
        { name: "Tổng phạt", value: fineStats.totalAmount, fill: "#3B82F6" },
        { name: "Đã thu", value: fineStats.paidAmount, fill: "#10B981" },
        { name: "Chưa thu", value: fineStats.unpaidAmount, fill: "#EF4444" },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng số sách"
          value={stats?.totalBooks?.toLocaleString() || 0}
          icon={<Book className="w-6 h-6 text-blue-600" />}
          bgColor="bg-white"
          iconBgColor="bg-blue-100"
        />
        <StatCard
          title="Người dùng"
          value={stats?.totalUsers?.toLocaleString() || 0}
          icon={<Users className="w-6 h-6 text-green-600" />}
          trend={stats?.growth?.users}
          trendUp={stats?.growth?.users?.startsWith("+")}
          bgColor="bg-white"
          iconBgColor="bg-green-100"
        />
        <StatCard
          title="Đang mượn"
          value={stats?.activeLoans?.toLocaleString() || 0}
          icon={<BookOpen className="w-6 h-6 text-amber-600" />}
          bgColor="bg-white"
          iconBgColor="bg-amber-100"
        />
        <StatCard
          title="Phạt chưa thu"
          value={formatCurrency(stats?.unpaidFines || 0)}
          icon={<DollarSign className="w-6 h-6 text-red-600" />}
          bgColor="bg-white"
          iconBgColor="bg-red-100"
        />
      </div>

      {/* Pending Stats & Monthly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Yêu cầu đang chờ xử lý
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <MiniStatCard
              title="Tổng chờ xử lý"
              value={pendingStats?.totalPending || 0}
              icon={<Clock className="w-4 h-4 text-blue-600" />}
              color="bg-blue-100"
            />
            <MiniStatCard
              title="Còn hiệu lực"
              value={pendingStats?.activeCount || 0}
              icon={<CheckCircle className="w-4 h-4 text-green-600" />}
              color="bg-green-100"
            />
            <MiniStatCard
              title="Đã hết hạn"
              value={pendingStats?.expiredCount || 0}
              icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
              color="bg-red-100"
            />
            <MiniStatCard
              title="Yêu cầu hôm nay"
              value={pendingStats?.todayCount || 0}
              icon={<Calendar className="w-4 h-4 text-purple-600" />}
              color="bg-purple-100"
            />
          </div>
        </div>

        {/* Fine Stats Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Thống kê tiền phạt
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <MiniStatCard
              title="Tổng số phạt"
              value={fineStats?.totalFines || 0}
              icon={<DollarSign className="w-4 h-4 text-blue-600" />}
              color="bg-blue-100"
            />
            <MiniStatCard
              title="Đã thanh toán"
              value={fineStats?.paidFines || 0}
              icon={<CheckCircle className="w-4 h-4 text-green-600" />}
              color="bg-green-100"
            />
            <MiniStatCard
              title="Chưa thanh toán"
              value={fineStats?.unpaidFines || 0}
              icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
              color="bg-red-100"
            />
            <MiniStatCard
              title="Phạt tháng này"
              value={fineStats?.thisMonthFines || 0}
              icon={<Calendar className="w-4 h-4 text-purple-600" />}
              color="bg-purple-100"
            />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Phân bố thể loại sách
          </h3>
          {categories.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categories.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) =>
                    `${category}: ${percentage}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="category"
                >
                  {categories.slice(0, 8).map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} sách`,
                    name,
                  ]}
                  contentStyle={{ borderRadius: "8px" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Không có dữ liệu
            </div>
          )}
        </div>

        {/* Fine Amount Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thống kê tiền phạt (VNĐ)
          </h3>
          {fineChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fineChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Số tiền",
                  ]}
                  contentStyle={{ borderRadius: "8px" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Không có dữ liệu
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Loans */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Mượn sách gần đây
          </h3>
          <div className="space-y-3">
            {recentActivities?.recentLoans &&
            recentActivities.recentLoans.length > 0 ? (
              recentActivities.recentLoans.map((loan) => (
                <div
                  key={loan._id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {loan.bookId?.title || "Không rõ sách"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {loan.userId?.fullName ||
                        loan.userId?.userName ||
                        "Ẩn danh"}{" "}
                      • {formatDate(loan.borrowDate)}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                    Đang mượn
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                Chưa có hoạt động mượn sách gần đây
              </p>
            )}
          </div>
        </div>

        {/* Recent Returns */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-green-600" />
            Trả sách gần đây
          </h3>
          <div className="space-y-3">
            {recentActivities?.recentReturns &&
            recentActivities.recentReturns.length > 0 ? (
              recentActivities.recentReturns.map((returnItem) => (
                <div
                  key={returnItem._id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <RotateCcw className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {returnItem.bookId?.title || "Không rõ sách"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {returnItem.userId?.fullName ||
                        returnItem.userId?.userName ||
                        "Ẩn danh"}{" "}
                      • {formatDate(returnItem.returnDate)}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    Đã trả
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                Chưa có hoạt động trả sách gần đây
              </p>
            )}
          </div>
        </div>
      </div>

      {/* New Users & Recent Fines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Users */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-purple-600" />
            Người dùng mới (7 ngày qua)
          </h3>
          <div className="space-y-3">
            {recentActivities?.newUsers &&
            recentActivities.newUsers.length > 0 ? (
              recentActivities.newUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.fullName || user.userName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                Chưa có người dùng mới
              </p>
            )}
          </div>
        </div>

        {/* Recent Fines Paid */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-600" />
            Phạt đã thu gần đây
          </h3>
          <div className="space-y-3">
            {recentActivities?.recentFines &&
            recentActivities.recentFines.length > 0 ? (
              recentActivities.recentFines.map((fine) => (
                <div
                  key={fine._id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fine.userId?.fullName ||
                        fine.userId?.userName ||
                        "Ẩn danh"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fine.book?.title || "Không rõ sách"} • Trễ{" "}
                      {fine.daysLate} ngày
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                    {formatCurrency(fine.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                Chưa có phạt được thu gần đây
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Stats Footer */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Thống kê tháng này</h3>
            <p className="text-blue-100">
              Tổng hợp hoạt động mượn sách trong tháng
            </p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats?.loansThisMonth || 0}</p>
              <p className="text-sm text-blue-100">Lượt mượn</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">
                {fineStats?.thisMonthFines || 0}
              </p>
              <p className="text-sm text-blue-100">Phạt phát sinh</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">
                {pendingStats?.todayCount || 0}
              </p>
              <p className="text-sm text-blue-100">Chờ xử lý hôm nay</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
