import { NextRequest, NextResponse } from "next/server";
export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;
  console.log("Middleware active: Pathname", url.pathname);
  console.log("Token:", token);

  if (url.pathname.startsWith("/send-message")) {
    console.log("Allowing /send-message without token");
    return NextResponse.next();
  }

  if (
    token &&
    (url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname.startsWith("/verify") ||
      url.pathname === "/")
  ) {
    console.log("Authenticated user attempting to access public route; redirecting to /dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token && url.pathname.startsWith("/dashboard")) {
    console.log("Unauthenticated access to /dashboard; redirecting to /sign-in");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  console.log("No redirection; passing through.");
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/sign-in",
    "/sign-up",
    "/",
    "/verify/:path*",
    "/dashboard/:path*",
    "/send-message/:path*",
  ],
};
