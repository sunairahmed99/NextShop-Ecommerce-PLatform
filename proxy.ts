import { NextResponse, NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const token = request.cookies.get('token')?.value || "";


    const isPublicPath = path === '/auth/login' || path === '/auth/register';

    const isProtectedPath = path === '/auth/userprofile' || path.startsWith('/admin') || path.startsWith('/api/admin');

    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/', request.nextUrl));
    }


    if (isProtectedPath && !token) {
        if (path.startsWith('/api')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/auth/login', request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/auth/login',
        '/auth/register',
        '/auth/userprofile',
        '/admin/:path*',
        '/api/admin/:path*',
    ],
};
