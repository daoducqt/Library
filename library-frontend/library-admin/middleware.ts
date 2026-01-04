import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Lấy token từ cookie
  const token = req.cookies.get("accessToken")?.value;

  // Các path không cần đăng nhập (trang login)
  const publicPaths = ["/login"];

  const path = req.nextUrl.pathname;

  // Kiểm tra xem path có phải là public không
  const isPublicPath = publicPaths.some(
    (publicPath) => path === publicPath || path.startsWith(`${publicPath}/`)
  );

  // Nếu không có token và không phải trang public thì redirect đến login
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callback", path);
    return NextResponse.redirect(loginUrl);
  }

  // Nếu có token rồi mà vào login thì tự chuyển ra trang chủ
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Áp dụng middleware cho tất cả các route trừ static files và api
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
