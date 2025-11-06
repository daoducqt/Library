"use client";
import React, { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password });
    alert("Đã gửi yêu cầu đăng nhập (demo).");
  };

  const coverImages = [
    "/sach1.webp",
    "/sach2.jpg",
    "/sach3.webp",
    "/sach4.jpg",
    "/sach5.jpg",
  ];
  const [activeCover, setActiveCover] = useState(2);

  const prevCover = () =>
    setActiveCover((s) => (s - 1 + coverImages.length) % coverImages.length);
  const nextCover = () => setActiveCover((s) => (s + 1) % coverImages.length);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative bg-cover bg-center"
      style={{ backgroundImage: "url('/BG login.jpg')" }}
      aria-live="polite"
    >
      {/* Overlay mờ nhẹ để làm nổi bật form */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />

      {/* subtle bookshelf pattern overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(34,197,94,0.02) 0 40px, transparent 40px 80px), linear-gradient(180deg, rgba(99,102,241,0.03), transparent)",
        }}
      />

      <div className="relative z-10 max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: visual / branding */}
        <div className="hidden md:flex flex-col items-start justify-center bg-[rgba(255,255,255,0.7)] backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/40">
          <div className="flex items-center gap-3 mb-6 w-full">
            <div className="w-12 h-12 bg-gradient-to-tr from-amber-400 to-rose-400 rounded-md flex items-center justify-center text-white font-bold shadow">
              B
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-800">
                Thư Viện Sách
              </h2>
              <p className="text-sm text-slate-500">Khám phá. Đọc. Ghi nhớ.</p>
            </div>
          </div>

          <div className="mb-6 w-full flex justify-center">
            <div className="relative w-[300px] h-40 flex items-center justify-center select-none">
              <button
                onClick={prevCover}
                aria-label="Previous cover"
                className="absolute -left-10 z-20 p-2 rounded-full bg-white/95 shadow-lg hover:bg-white hover:scale-110 transition-all"
              >
                ‹
              </button>

              <div
                className="w-[120px] h-40 flex items-center justify-center"
                style={{ perspective: 800 }}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  {coverImages.map((src, i) => {
                    const raw = i - activeCover;
                    const len = coverImages.length;
                    const offset =
                      raw > len / 2
                        ? raw - len
                        : raw < -len / 2
                        ? raw + len
                        : raw;
                    const abs = Math.abs(offset);
                    const translateX = offset * 45; // ← GIẢM
                    const rotateY = offset * -20; // ← GIẢM
                    const scale = Math.max(0.75, 1 - abs * 0.08); // ← TĂNG scale min
                    const zIndex = 100 - abs;
                    const width = 130 - abs * 12; // ← SÁCH NHỎ
                    return (
                      <img
                        key={src}
                        src={src}
                        alt={`cover-${i}`}
                        onClick={() => setActiveCover(i)}
                        className="absolute rounded-lg shadow-xl border-2 border-white/80 transition-all duration-300 cursor-pointer"
                        style={{
                          transform: `translateX(${translateX}px) translateZ(${
                            -abs * 25
                          }px) rotateY(${rotateY}deg) scale(${scale})`,
                          zIndex,
                          width: `${width}px`,
                          height: "180px", // ← GIẢM RẤT NHIỀU
                          objectFit: "cover",
                          left: "50%",
                          marginLeft: `-${width / 2}px`,
                          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))", // ← SHADOW RÕ HƠN
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <button
                onClick={nextCover}
                aria-label="Next cover"
                className="absolute -right-10 z-20 p-2 rounded-full bg-white/95 shadow-lg hover:bg-white hover:scale-110 transition-all"
              >
                ›
              </button>
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-500 text-center w-full">
            Khám phá bộ sưu tập sách
          </p>
        </div>

        {/* Right: form - GIỮ NGUYÊN */}
        <div className="bg-white/90 rounded-2xl p-8 shadow-xl border border-slate-100 backdrop-blur-sm">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-slate-800">
              Chào mừng trở lại
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Đăng nhập để tiếp tục khám phá kho sách của bạn
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 12l-4-3-4 3m8 0v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6"
                    />
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  placeholder="you@example.com"
                  aria-label="Email"
                />
              </div>
            </label>

            {/* Password */}
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Mật khẩu
              </span>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m0-8v2m4 0v4a4 4 0 0 1-8 0v-4"
                    />
                  </svg>
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-10 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  placeholder="Nhập mật khẩu"
                  aria-label="Mật khẩu"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-2 flex items-center px-2 text-sm text-slate-500"
                  aria-pressed={showPassword}
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </label>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span>Ghi nhớ tôi</span>
              </label>
              <a href="#" className="text-amber-600 hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 text-white font-semibold shadow hover:scale-[1.01] transition-transform"
              >
                Đăng nhập
              </button>
            </div>

            {/* Social Login */}
            <div className="text-center text-sm text-slate-500">
              Hoặc đăng nhập với
              <div className="mt-3 flex justify-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:shadow"
                  aria-label="Sign in with Google"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 533.5 544.3"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="#4285f4"
                      d="M533.5 278.4c0-17.4-1.4-34.1-4-50.4H272v95.3h147.1c-6.4 34.6-25.8 63.9-55.2 83.5v69.4h89.1c52.3-48.2 82.5-119.3 82.5-197.8z"
                    />
                    <path
                      fill="#34a853"
                      d="M272 544.3c74 0 136-24.6 181.3-66.9l-89.1-69.4c-25 17-57 27-92.2 27-70.9 0-131-47.9-152.3-112.5H28.6v70.6C73.7 486.9 166 544.3 272 544.3z"
                    />
                    <path
                      fill="#fbbc04"
                      d="M119.7 323.5c-8.6-25.9-8.6-53.8 0-79.7V173.2H28.6c-39.5 78.9-39.5 171.6 0 250.5l91.1-100.2z"
                    />
                    <path
                      fill="#ea4335"
                      d="M272 107.6c39.8-.6 78.2 14.5 107.4 41.9l80.6-80.6C406.1 26 344.1 0 272 0 166 0 73.7 57.4 28.6 142.8l91.1 70.6C141 155.5 201.1 107.6 272 107.6z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:shadow"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M12 2C8.1 2 5 5.1 5 9c0 4 3 7 7 7s7-3 7-7c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5zM4 20c0-3.3 4.7-5 8-5s8 1.7 8 5v1H4v-1z" />
                  </svg>
                  Guest
                </button>
              </div>
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-slate-500">
              Chưa có tài khoản?{" "}
              <a href="#" className="text-amber-600 hover:underline">
                Đăng ký
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
