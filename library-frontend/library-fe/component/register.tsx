"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userApi } from "@/service/register/register";
import { RegisterRequest } from "@/type/register";
import { AxiosError } from "axios";
export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    userName: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
  }

  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 5 + 3,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !formData.userName ||
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (!acceptTerms) {
      setError("Vui lòng đồng ý với điều khoản sử dụng");
      return;
    }

    setIsLoading(true);

    try {
      const registerData: RegisterRequest = {
        userName: formData.userName,
        password: formData.password,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      };

      const response = await userApi.register(registerData);

      console.log("Register successful:", response);

      // Chuyển đến trang login sau khi đăng ký thành công
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("/login");
    } catch (err: unknown) {
      console.error("Register error:", err);
      const error = err as AxiosError<{ message: string }>;
      const errorMessage =
        error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at bottom, #1a0a2e 0%, #0a0118 100%)",
      }}
      aria-live="polite"
    >
      {/* Animated starfield background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background:
                particle.size > 2
                  ? "linear-gradient(45deg, #a78bfa, #60a5fa)"
                  : "#e0e7ff",
              boxShadow:
                particle.size > 2
                  ? "0 0 10px #a78bfa, 0 0 20px #a78bfa"
                  : "0 0 5px #e0e7ff",
              animation: `twinkle ${particle.duration}s ease-in-out ${
                particle.delay
              }s infinite, float ${particle.duration * 2}s ease-in-out ${
                particle.delay
              }s infinite`,
            }}
          />
        ))}
      </div>

      {/* Animated magical circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full border border-purple-500/20"
          style={{
            width: "400px",
            height: "400px",
            top: "10%",
            left: "5%",
            animation:
              "rotate 20s linear infinite, pulse 4s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full border border-blue-500/20"
          style={{
            width: "300px",
            height: "300px",
            bottom: "15%",
            right: "10%",
            animation:
              "rotate 15s linear infinite reverse, pulse 3s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full border border-indigo-500/20"
          style={{
            width: "500px",
            height: "500px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation:
              "rotate 25s linear infinite, pulse 5s ease-in-out infinite",
          }}
        />
      </div>

      {/* Floating book particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={`book-${i}`}
            className="absolute text-purple-300/20 text-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${8 + i * 2}s ease-in-out ${i * 1.5}s infinite`,
            }}
          >
            📖
          </div>
        ))}
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-20 right-20 w-40 h-40 bg-blue-600/30 rounded-full blur-3xl"
        style={{ animation: "pulse 3s ease-in-out infinite" }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-24 h-24 bg-indigo-600/30 rounded-full blur-2xl"
        style={{ animation: "pulse 4s ease-in-out 1s infinite" }}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes borderGlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `,
        }}
      />

      <div className="relative z-10 max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: visual / branding */}
        <div className="hidden md:flex flex-col items-start justify-center bg-gradient-to-br from-slate-900/80 to-purple-950/70 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-purple-500/40 relative overflow-hidden group">
          {/* Animated border glow */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background:
                "linear-gradient(45deg, transparent, rgba(139,92,246,0.3), transparent)",
              animation: "borderGlow 3s linear infinite",
            }}
          />

          {/* Inner glow effects */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/20 via-transparent to-blue-600/20 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl"
            style={{ animation: "pulse 4s ease-in-out infinite" }}
          />

          <div className="flex items-center gap-3 mb-6 w-full relative z-10">
            <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/50 border border-purple-400/30 animate-pulse">
              <svg
                className="w-7 h-7"
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
            </div>
            <div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300 animate-pulse">
                Grimoire Library
              </h2>
              <p className="text-sm text-purple-300/70">
                ✨ Khám phá. Ma thuật. Tri thức.
              </p>
            </div>
          </div>

          <div className="mb-6 w-full flex justify-center relative z-10">
            <div className="relative w-[300px] h-40 flex items-center justify-center select-none">
              <button
                onClick={prevCover}
                aria-label="Previous cover"
                className="absolute -left-10 z-20 p-2 rounded-full bg-slate-800/95 shadow-lg shadow-purple-500/50 hover:bg-slate-700 hover:scale-110 transition-all border border-purple-500/40 text-purple-300 hover:shadow-purple-400/70"
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
                    const translateX = offset * 45;
                    const rotateY = offset * -20;
                    const scale = Math.max(0.75, 1 - abs * 0.08);
                    const zIndex = 100 - abs;
                    const width = 130 - abs * 12;
                    return (
                      <img
                        key={src}
                        src={src}
                        alt={`cover-${i}`}
                        onClick={() => setActiveCover(i)}
                        className="absolute rounded-lg shadow-2xl border-2 transition-all duration-300 cursor-pointer hover:scale-105"
                        style={{
                          transform: `translateX(${translateX}px) translateZ(${
                            -abs * 25
                          }px) rotateY(${rotateY}deg) scale(${scale})`,
                          zIndex,
                          width: `${width}px`,
                          height: "180px",
                          objectFit: "cover",
                          left: "50%",
                          marginLeft: `-${width / 2}px`,
                          filter: `drop-shadow(0 4px 12px rgba(139,92,246,${
                            offset === 0 ? 0.7 : 0.2
                          }))`,
                          borderColor:
                            offset === 0
                              ? "rgba(139,92,246,0.8)"
                              : "rgba(139,92,246,0.2)",
                          boxShadow:
                            offset === 0
                              ? "0 0 20px rgba(139,92,246,0.5)"
                              : "none",
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <button
                onClick={nextCover}
                aria-label="Next cover"
                className="absolute -right-10 z-20 p-2 rounded-full bg-slate-800/95 shadow-lg shadow-purple-500/50 hover:bg-slate-700 hover:scale-110 transition-all border border-purple-500/40 text-purple-300 hover:shadow-purple-400/70"
              >
                ›
              </button>
            </div>
          </div>

          <p className="mt-2 text-xs text-purple-300/60 text-center w-full relative z-10 animate-pulse">
            🔮 Gia nhập cộng đồng pháp sư tri thức
          </p>
        </div>

        {/* Right: form */}
        <div className="bg-gradient-to-br from-slate-900/90 to-purple-950/85 rounded-2xl p-8 shadow-2xl border border-purple-500/40 backdrop-blur-xl relative overflow-hidden group">
          {/* Animated corner lights */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-600/30 to-transparent rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-600/30 to-transparent rounded-full blur-3xl"
            style={{ animation: "pulse 3s ease-in-out 1s infinite" }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
            style={{ animation: "pulse 4s ease-in-out 2s infinite" }}
          />

          {/* Sparkle effects */}
          <div className="absolute top-10 right-10 w-2 h-2 bg-purple-400 rounded-full animate-ping" />
          <div
            className="absolute top-20 right-20 w-1 h-1 bg-blue-400 rounded-full"
            style={{ animation: "twinkle 2s ease-in-out infinite" }}
          />
          <div
            className="absolute bottom-20 left-10 w-2 h-2 bg-indigo-400 rounded-full"
            style={{ animation: "twinkle 3s ease-in-out 1s infinite" }}
          />
          <div className="absolute bottom-10 right-1/3 w-1 h-1 bg-purple-300 rounded-full animate-ping" />

          <div className="mb-6 relative z-10">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-blue-300 to-purple-300">
              ✨ Tạo tài khoản mới
            </h1>
            <p className="text-sm text-purple-300/70 mt-1">
              🌙 Bắt đầu hành trình khám phá tri thức ma thuật
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-sm relative z-10">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {/* Username */}
            <label className="block">
              <span className="text-sm font-medium text-purple-200 flex items-center gap-2">
                <span className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></span>
                Tên đăng nhập
              </span>
              <div className="mt-1 relative group">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
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
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-3 py-2 rounded-xl border border-purple-500/30 bg-slate-800/50 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:shadow-lg focus:shadow-purple-500/30 transition-all hover:border-purple-400/50"
                  placeholder="Nhập tên đăng nhập"
                  aria-label="Tên đăng nhập"
                />
              </div>
            </label>

            {/* Full Name */}
            <label className="block">
              <span className="text-sm font-medium text-purple-200 flex items-center gap-2">
                <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></span>
                Họ và tên
              </span>
              <div className="mt-1 relative group">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-3 py-2 rounded-xl border border-purple-500/30 bg-slate-800/50 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:shadow-lg focus:shadow-purple-500/30 transition-all hover:border-purple-400/50"
                  placeholder="Nhập họ và tên của bạn"
                  aria-label="Họ và tên"
                />
              </div>
            </label>

            {/* Email */}
            <label className="block">
              <span className="text-sm font-medium text-purple-200 flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></span>
                Email
              </span>
              <div className="mt-1 relative group">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-3 py-2 rounded-xl border border-purple-500/30 bg-slate-800/50 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:shadow-lg focus:shadow-purple-500/30 transition-all hover:border-purple-400/50"
                  placeholder="you@grimoire.com"
                  aria-label="Email"
                />
              </div>
            </label>

            {/* Phone */}
            <label className="block">
              <span className="text-sm font-medium text-purple-200 flex items-center gap-2">
                <span className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse"></span>
                Số điện thoại
              </span>
              <div className="mt-1 relative group">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-11 pr-3 py-2 rounded-xl border border-purple-500/30 bg-slate-800/50 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:shadow-lg focus:shadow-purple-500/30 transition-all hover:border-purple-400/50"
                  placeholder="0123456789 (không bắt buộc)"
                  aria-label="Số điện thoại"
                />
              </div>
            </label>

            {/* Password */}
            <label className="block">
              <span className="text-sm font-medium text-purple-200 flex items-center gap-2">
                <span className="w-1 h-1 bg-pink-400 rounded-full animate-pulse"></span>
                Mật khẩu
              </span>
              <div className="mt-1 relative group">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-10 py-2 rounded-xl border border-purple-500/30 bg-slate-800/50 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:shadow-lg focus:shadow-purple-500/30 transition-all hover:border-purple-400/50"
                  placeholder="Tối thiểu 6 ký tự"
                  aria-label="Mật khẩu"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-2 flex items-center px-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  aria-pressed={showPassword}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </label>

            {/* Confirm Password */}
            <label className="block">
              <span className="text-sm font-medium text-purple-200 flex items-center gap-2">
                <span className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></span>
                Xác nhận mật khẩu
              </span>
              <div className="mt-1 relative group">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-10 py-2 rounded-xl border border-purple-500/30 bg-slate-800/50 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:shadow-lg focus:shadow-purple-500/30 transition-all hover:border-purple-400/50"
                  placeholder="Nhập lại mật khẩu"
                  aria-label="Xác nhận mật khẩu"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-2 flex items-center px-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </label>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-purple-500/30 bg-slate-800/50 text-purple-600 focus:ring-purple-500 focus:ring-2"
              />
              <label
                htmlFor="terms"
                className="text-sm text-purple-300/70 cursor-pointer hover:text-purple-300 transition-colors"
              >
                Tôi đồng ý với{" "}
                <a
                  href="#"
                  className="text-blue-400 hover:text-blue-300 hover:underline"
                >
                  điều khoản sử dụng
                </a>{" "}
                và{" "}
                <a
                  href="#"
                  className="text-blue-400 hover:text-blue-300 hover:underline"
                >
                  chính sách bảo mật
                </a>
              </label>
            </div>

            {/* Submit */}
            <div className="relative">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-semibold shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-[1.02] transition-all border border-purple-400/30 hover:border-purple-300/50 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <span className="animate-spin">⏳</span> Đang xử lý...
                    </>
                  ) : (
                    <>
                      ✨ Đăng ký ngay
                      <span className="inline-block group-hover:rotate-12 transition-transform">
                        🌟
                      </span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </button>
            </div>

            {/* Divider */}
            <div className="text-center text-sm text-purple-300/70">
              <span className="flex items-center justify-center gap-2">
                <span className="w-8 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></span>
                Hoặc
                <span className="w-8 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></span>
              </span>
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-purple-300/70">
              Đã có tài khoản?{" "}
              <a
                href="/login"
                className="text-blue-400 hover:text-blue-300 hover:underline transition-colors font-medium"
              >
                Đăng nhập ngay 🔑
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
