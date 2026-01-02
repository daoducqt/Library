import { repositoryApi } from "@/src/api/repositories/Repository";
import {
  DashboardStatsResponse,
  DashboardStats,
  CategoryDistributionResponse,
  CategoryItem,
  FineStatsResponse,
  FineStats,
  PendingStatsResponse,
  PendingStats,
  RecentActivitiesResponse,
  RecentActivities,
} from "@/src/type/dashboard";

// Lấy thống kê tổng quan dashboard
export const getDashboardStats = async (): Promise<DashboardStats | undefined> => {
  const res = await repositoryApi.get<DashboardStatsResponse>("/admin-dashboard/dashboard-stats");
  return res?.data;
};

// Lấy phân bố thể loại sách
export const getCategoryDistribution = async (): Promise<CategoryItem[] | undefined> => {
  const res = await repositoryApi.get<CategoryDistributionResponse>("/admin-dashboard/category-distribution");
  return res?.data;
};

// Lấy thống kê tiền phạt
export const getFineStats = async (): Promise<FineStats | undefined> => {
  const res = await repositoryApi.get<FineStatsResponse>("/admin-dashboard/fine-stats");
  return res?.data;
};

// Lấy thống kê yêu cầu đang chờ
export const getPendingStats = async (): Promise<PendingStats | undefined> => {
  const res = await repositoryApi.get<PendingStatsResponse>("/admin-dashboard/pending-stats");
  return res?.data;
};

// Lấy hoạt động gần đây
export const getRecentActivities = async (limit: number = 10): Promise<RecentActivities | undefined> => {
  const res = await repositoryApi.get<RecentActivitiesResponse>(`/admin-dashboard/recent-activities?limit=${limit}`);
  return res?.data;
};
