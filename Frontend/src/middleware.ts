import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que requerem autenticação
const protectedRoutes = ['/painel'];

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/login', '/', '/api/health'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 🔧 CORREÇÃO CRÍTICA: Permitir TODAS as rotas /api/ sem verificação
  // Isso resolve o problema de middleware interferindo no proxy
  if (pathname.startsWith('/api/')) {
    console.log(`🔧 Middleware: Permitindo rota API: ${pathname}`);
    return NextResponse.next();
  }
  
  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Verificar se é uma rota pública (exceto APIs que já foram tratadas acima)
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  
  // Se for rota pública, permitir acesso
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Se for rota protegida, verificar autenticação
  if (isProtectedRoute) {
    // Verificar se tem token de autenticação
    const token = request.cookies.get('fluyt_auth_token');
    
    if (!token) {
      // Redirecionar para login se não tiver token
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      console.log(`🔧 Middleware: Redirecionando para login: ${pathname}`);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

// Configurar em quais rotas o middleware deve executar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - public folder
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|public/|favicon.ico).*)',
  ],
};