"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

type Props = {
  onSearch?: (q: string) => void;
};

export default function Header({ onSearch }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (onSearch) onSearch(query);
    console.log("Search:", query);
  };

  return (
    <header className="bg-amber-50/80 backdrop-blur-sm text-amber-900 shadow-sm border-b border-amber-200/60">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo + tên trang */}
        <Link
          href="/"
          aria-label="The Mind Library home"
          className="flex items-center gap-3 text-amber-900 no-underline hover:opacity-80 transition-opacity"
        >
          <div className="relative">
            <svg
              className="w-10 h-10"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Book spines with amber colors */}
              <rect
                x="2"
                y="4"
                width="8"
                height="14"
                rx="1.5"
                fill="#f59e0b"
                opacity="0.7"
              />
              <rect
                x="14"
                y="4"
                width="8"
                height="14"
                rx="1.5"
                fill="#d97706"
                opacity="0.8"
              />
              <path
                d="M4 6h6"
                stroke="#92400e"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
              <path
                d="M14 6h6"
                stroke="#92400e"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="leading-tight">
            <div className="text-lg font-semibold text-amber-900">
              The Mind Library
            </div>
            <div className="text-xs text-amber-700/90">
              Explore · Learn · Reflect
            </div>
          </div>
        </Link>

        {/* Menu chính */}
        <nav className="flex-1 flex items-center justify-end gap-4">
          <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0">
            <li>
              <Link
                href="/"
                className="px-3 py-2 rounded-lg font-medium text-amber-900 hover:bg-amber-100/60 transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/catalog"
                className="px-3 py-2 rounded-lg font-medium text-amber-900 hover:bg-amber-100/60 transition-colors"
              >
                Catalog
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="px-3 py-2 rounded-lg font-medium text-amber-900 hover:bg-amber-100/60 transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="px-3 py-2 rounded-lg font-medium text-amber-900 hover:bg-amber-100/60 transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>

          {/* Ô tìm kiếm */}
          <form onSubmit={submit} className="flex items-center gap-2">
            <label htmlFor="site-search" className="sr-only">
              Tìm kiếm sách
            </label>
            <input
              id="site-search"
              name="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm sách, tác giả, chủ đề..."
              aria-label="Tìm sách"
              className="min-w-[180px] md:min-w-[240px] px-3 py-2 rounded-lg text-amber-900 bg-white/70 border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300/50 focus:border-amber-300 placeholder-amber-600/70"
            />
            <button
              type="submit"
              className="bg-amber-500 text-amber-900 px-3 py-2 rounded-lg font-semibold hover:bg-amber-400 transition-colors focus:ring-2 focus:ring-amber-300/50 focus:outline-none"
              aria-label="Search"
            >
              Tìm
            </button>
          </form>

          {/* Nút menu mobile */}
          <button
            onClick={() => setOpen((s) => !s)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="md:hidden ml-2 p-2 rounded-lg border border-amber-300 hover:bg-amber-100/60 transition-colors"
            title="Mở menu"
          >
            <span className="sr-only">Mở menu</span>
            {open ? (
              <svg
                className="w-6 h-6 text-amber-900"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 18L18 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-amber-900"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-menu"
          className="md:hidden bg-amber-50/90 backdrop-blur-sm border-t border-amber-200/60"
        >
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            <Link
              href="/"
              className="block px-3 py-2 rounded-lg font-medium text-amber-900 hover:bg-amber-100/60 transition-colors"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/catalog"
              className="block px-3 py-2 rounded-lg font-medium text-amber-900 hover:bg-amber-100/60 transition-colors"
              onClick={() => setOpen(false)}
            >
              Catalog
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 rounded-lg font-medium text-amber-900 hover:bg-amber-100/60 transition-colors"
              onClick={() => setOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 rounded-lg font-medium text-amber-900 hover:bg-amber-100/60 transition-colors"
              onClick={() => setOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
