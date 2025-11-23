"use client";
import { userApi } from "@/service/login/login";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Thêm import này
import { LoginResponse } from "@/type/login";
export default function Login() {
  const router = useRouter(); // Thêm hook này
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await userApi.login({
        account: email,
        password: password,
      });

      const data = response?.data;

      console.log("Login successful:", data);

      // Lưu tokens và user info vào localStorage
      if (data?.accessToken) {
        document.cookie = `accessToken=${data.accessToken}; path=/; secure; samesite=strict`;
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Chỉ chuyển trang khi login thành công
        router.push("/");
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);

      // Type guard để kiểm tra axios error
      if (err && typeof err === "object" && "response" in err) {
        const error = err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };
        setError(
          error.response?.data?.message ||
            "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
        );
      } else {
        setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
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
            🔮 Khám phá bộ sưu tập grimoire cổ đại
          </p>

          <style
            dangerouslySetInnerHTML={{
              __html: `
            @keyframes borderGlow {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `,
            }}
          />
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
              ✨ Chào mừng trở lại
            </h1>
            <p className="text-sm text-purple-300/70 mt-1">
              🌙 Đăng nhập để tiếp tục hành trình ma thuật
            </p>
          </div>

          <div className="space-y-4 relative z-10">
            {/* Email */}
            <label className="block">
              <span className="text-sm font-medium text-purple-200 flex items-center gap-2">
                <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></span>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-3 py-2 rounded-xl border border-purple-500/30 bg-slate-800/50 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:shadow-lg focus:shadow-purple-500/30 transition-all hover:border-purple-400/50"
                  placeholder="you@grimoire.com"
                  aria-label="Email"
                />
              </div>
            </label>

            {/* Password */}
            <label className="block">
              <span className="text-sm font-medium text-purple-200 flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></span>
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-10 py-2 rounded-xl border border-purple-500/30 bg-slate-800/50 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:shadow-lg focus:shadow-purple-500/30 transition-all hover:border-purple-400/50"
                  placeholder="Nhập mật khẩu ma thuật"
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

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-purple-500/30 bg-slate-800/50 text-purple-600 focus:ring-purple-500 focus:ring-2"
                />
                <span>Ghi nhớ tôi</span>
              </label>
              <a
                href="#"
                className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
              >
                Quên mật khẩu? 🔑
              </a>
            </div>

            {/* Submit */}
            <div className="relative">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-semibold shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-[1.02] transition-all border border-purple-400/30 hover:border-purple-300/50 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  ✨ Đăng nhập
                  <span className="inline-block group-hover:rotate-12 transition-transform">
                    🔮
                  </span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </button>
            </div>

            {/* Social Login */}
            <div className="text-center text-sm text-purple-300/70">
              <span className="flex items-center justify-center gap-2">
                <span className="w-8 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></span>
                Hoặc đăng nhập với
                <span className="w-8 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></span>
              </span>
              <div className="mt-3 flex justify-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-500/30 bg-slate-800/50 text-purple-200 hover:bg-slate-800 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all hover:border-purple-400/50"
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
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-500/30 bg-slate-800/50 text-purple-200 hover:bg-slate-800 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all hover:border-purple-400/50"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M12 2C8.1 2 5 5.1 5 9c0 4 3 7 7 7s7-3 7-7c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5zM4 20c0-3.3 4.7-5 8-5s8 1.7 8 5v1H4v-1z" />
                  </svg>
                  Guest 👤
                </button>
              </div>
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-purple-300/70">
              Chưa có tài khoản?{" "}
              <a
                href="#"
                className="text-blue-400 hover:text-blue-300 hover:underline transition-colors font-medium"
              >
                Đăng ký ngay 🌟
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
