import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('lumen_token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';

  // 1. Token yoksa ve login sayfasında değilse -> Login'e Proxy/Redirect yap
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Token varsa ve login'e gitmeye çalışıyorsa -> Dashboard'a gönder
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}