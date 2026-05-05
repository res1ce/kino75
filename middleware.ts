import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Простая хэш-функция для IP (для приватности)
function hashIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Игнорируем статические файлы и API запросы
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts')
  ) {
    return NextResponse.next();
  }

  // Игнорируем админ-панель (чтобы не накручивать статистику)
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Получаем IP и User-Agent
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';

  // Хэшируем IP для приватности
  const hashedIP = hashIP(ip);

  // Отправляем данные в фоновом режиме
  // Используем waitUntil для неблокирующей записи
  const url = new URL('/api/statistics', request.url);
  
  // Создаем fetch запрос для записи статистики
  const statsPromise = fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: pathname,
      userAgent,
      ip: hashedIP,
      referer: referer || null,
    }),
  }).catch(() => {
    // Игнорируем ошибки записи статистики
  });

  // Для Next.js 14+ используем request.fetch для фоновой записи
  const response = NextResponse.next();
  
  // В Next.js middleware мы не можем использовать waitUntil напрямую,
  // поэтому используем другой подход - клиентскую запись
  // Middleware только добавляет заголовки для клиентского компонента
  
  response.headers.set('x-user-ip', hashedIP);
  response.headers.set('x-user-agent', userAgent);
  response.headers.set('x-referer', referer);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
