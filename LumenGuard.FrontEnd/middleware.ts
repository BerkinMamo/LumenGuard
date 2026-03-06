import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('lumen_token')?.value;
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === '/login';
  const isAuthPath = pathname.startsWith('/connect') || pathname.startsWith('/api/auth');

  if (!token && !isLoginPage && !isAuthPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();

  // 🛡️ Geliştirme aşamasında tarayıcıya CORS ve HSTS esnekliği tanıyan mühür
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('Access-Control-Allow-Origin', 'https://lumen.lunalux.com.tr');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|images).*)',
  ],
}