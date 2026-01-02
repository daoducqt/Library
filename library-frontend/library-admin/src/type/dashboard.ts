// Dashboard Stats Types
export interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  activeLoans: number;
  loansThisMonth: number;
  unpaidFines: number;
  growth: {
    users: string;
    loans: string;
  };
}

export interface DashboardStatsResponse {
  status: number;
  message: string;
  data: DashboardStats;
}

// Category Distribution Types
export interface CategoryItem {
  category: string;
  count: number;
  percentage: number;
}

export interface CategoryDistributionResponse {
  status: number;
  message: string;
  data: CategoryItem[];
}

// Fine Stats Types
export interface FineStats {
  totalFines: number;
  unpaidFines: number;
  paidFines: number;
  thisMonthFines: number;
  totalAmount: number;
  unpaidAmount: number;
  paidAmount: number;
}

export interface FineStatsResponse {
  status: number;
  message: string;
  data: FineStats;
}

// Pending Stats Types
export interface PendingStats {
  totalPending: number;
  expiredCount: number;
  todayCount: number;
  activeCount: number;
}

export interface PendingStatsResponse {
  status: number;
  message: string;
  data: PendingStats;
}

// Recent Activities Types
export interface UserInfo {
  _id: string;
  fullName: string;
  userName: string;
  avatar?: string;
  email: string;
}

export interface BookInfo {
  _id: string;
  title: string;
  author: string;
  image?: string;
  coverId?: string;
}

export interface RecentLoan {
  _id: string;
  userId: UserInfo;
  bookId: BookInfo;
  borrowDate: string;
  dueDate: string;
  status: string;
}

export interface RecentReturn {
  _id: string;
  userId: UserInfo;
  bookId: BookInfo;
  returnDate: string;
  borrowDate: string;
  status: string;
}

export interface RecentFine {
  _id: string;
  userId: UserInfo;
  loanId: string;
  amount: number;
  daysLate: number;
  paidAt: string;
  book?: BookInfo;
}

export interface NewUser {
  _id: string;
  fullName: string;
  userName: string;
  email: string;
  avatar?: string;
  createdAt: string;
  role: string;
}

export interface RecentActivities {
  recentLoans: RecentLoan[];
  recentReturns: RecentReturn[];
  recentFines: RecentFine[];
  newUsers: NewUser[];
}

export interface RecentActivitiesResponse {
  status: number;
  message: string;
  data: RecentActivities;
}
