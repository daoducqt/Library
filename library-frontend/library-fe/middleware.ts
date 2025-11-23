import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Lấy token từ cookie
  const token = req.cookies.get("accessToken")?.value;

  // Các path không cần đăng nhập
  const publicPaths = ["/login", "/register"];

  const path = req.nextUrl.pathname;

  // Nếu không có token và không phải trang public thì redirect
  if (!token && !publicPaths.includes(path)) {
    return NextResponse.redirect(
      new URL(`/login?callback=${path}`, req.url)
    );
  }

  // Nếu có token rồi mà vào login thì tự chuyển ra home
  if (token && path.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Áp dụng middleware cho toàn bộ route
export const config = {
      matcher: [
        "/",
    "/profile/:path*", 
    "/admin/:path*", 
    "/books/:path*", 
    "/dashboard/:path*"
  ],
};
