"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Library,
  FolderTree,
  MapPin,
  Bell,
  Package,
} from "lucide-react";

interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: <LayoutDashboard size={20} />,
  },
  {
    name: "Quản lý sách",
    href: "/books",
    icon: <BookOpen size={20} />,
  },
  {
    name: "Danh mục",
    href: "/categories",
    icon: <FolderTree size={20} />,
  },
  {
    name: "Người dùng",
    href: "/users",
    icon: <Users size={20} />,
  },
  {
    name: "Phiếu mượn",
    href: "/loans",
    icon: <FileText size={20} />,
  },
  {
    name: "Tiền phạt",
    href: "/fines",
    icon: <CreditCard size={20} />,
  },
  {
    name: "Vị trí",
    href: "/locations",
    icon: <MapPin size={20} />,
  },
  {
    name: "Nhập kho",
    href: "/stock-in",
    icon: <Package size={20} />,
  },
  {
    name: "Thông báo",
    href: "/notifications",
    icon: <Bell size={20} />,
  },
  {
    name: "Cài đặt",
    href: "/settings",
    icon: <Settings size={20} />,
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-gradient-to-b from-blue-900 to-blue-800 text-white min-h-screen transition-all duration-300 flex flex-col shadow-xl`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-blue-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Library size={28} className="text-yellow-400" />
            <span className="font-bold text-xl">Library Admin</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-blue-100 hover:bg-blue-700/50"
                  } ${collapsed ? "justify-center" : ""}`}
                  title={collapsed ? item.name : undefined}
                >
                  <span className={isActive ? "text-yellow-400" : ""}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-blue-700">
        <button
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all w-full ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Đăng xuất" : undefined}
        >
          <LogOut size={20} />
          {!collapsed && <span className="font-medium">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}
