"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Props = {
  onSearch?: (q: string) => void;
};

export default function Header({ onSearch }: Props) {
  const [query, setQuery] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (onSearch) onSearch(query);
    console.log("Search:", query);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 text-white shadow-xl sticky top-0 z-50 border-b border-cyan-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Library Name */}
          <Link
            href="/"
            className="flex items-center gap-3 text-white no-underline hover:opacity-90 transition-opacity"
          >
            <div className="relative">
              <svg
                className="w-10 h-10"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Modern book icon with gradient effect */}
                <path
                  d="M12 8C10.3431 8 9 9.34315 9 11V37C9 38.6569 10.3431 40 12 40H36C37.6569 40 39 38.6569 39 37V11C39 9.34315 37.6569 8 36 8H12Z"
                  fill="white"
                  opacity="0.9"
                />
                <path d="M14 12H34V36H14V12Z" fill="url(#gradient1)" />
                <path
                  d="M18 16H30M18 20H30M18 24H26"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="24" cy="32" r="3" fill="#FCD34D" />
                <defs>
                  <linearGradient
                    id="gradient1"
                    x1="14"
                    y1="12"
                    x2="34"
                    y2="36"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#818CF8" />
                    <stop offset="1" stopColor="#C084FC" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="hidden sm:block">
              <div className="text-xl font-bold tracking-tight">
                📚 The Mind Library
              </div>
              <div className="text-xs text-white/80 font-light">
                Khám phá tri thức vô tận
              </div>
            </div>
          </Link>

          {/* Search Bar - Center */}
          <form
            onSubmit={submit}
            className="flex-1 max-w-2xl mx-4 hidden md:block"
          >
            <div className="relative">
              <input
                id="site-search"
                name="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm sách, tác giả, thể loại..."
                className="w-full px-4 py-2 pl-10 pr-24 rounded-full text-gray-100 bg-white/15 backdrop-blur-md border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 placeholder-gray-300/70 shadow-lg hover:bg-white/20 transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-1.5 rounded-full font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
              >
                Tìm
              </button>
            </div>
          </form>

          {/* User Account Dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all border border-white/20"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-white shadow-lg">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    userDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Info Section */}
                  <div className="bg-gradient-to-r from-slate-800 to-cyan-800 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg border-2 border-white/30">
                        JD
                      </div>
                      <div>
                        <div className="font-semibold text-white">John Doe</div>
                        <div className="text-xs text-white/80">
                          john.doe@email.com
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-200 hover:bg-gray-800 transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <svg
                        className="w-5 h-5 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="font-medium">Hồ sơ của tôi</span>
                    </Link>

                    <Link
                      href="/my-books"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-200 hover:bg-gray-800 transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <svg
                        className="w-5 h-5 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      <span className="font-medium">Sách của tôi</span>
                    </Link>

                    <Link
                      href="/borrowed"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-200 hover:bg-gray-800 transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <svg
                        className="w-5 h-5 text-teal-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                      <span className="font-medium">Sách đã mượn</span>
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-200 hover:bg-gray-800 transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="font-medium">Cài đặt</span>
                    </Link>

                    <hr className="my-2 border-gray-700" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        // Add logout logic here
                        console.log("Logging out...");
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-gray-800 transition-colors w-full"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="font-medium">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={submit}>
            <div className="relative">
              <input
                name="query-mobile"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm sách..."
                className="w-full px-4 py-2 pl-10 rounded-full text-gray-100 bg-white/15 backdrop-blur-md border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 placeholder-gray-300/70"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}
