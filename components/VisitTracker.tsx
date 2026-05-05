'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Игнорируем админ-панель и статические файлы
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api')
    ) {
      return;
    }

    // Отправляем данные о посещении
    const trackVisit = async () => {
      try {
        await fetch('/api/statistics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: pathname,
            userAgent: navigator.userAgent,
            referer: document.referrer || null,
          }),
        });
      } catch (error) {
        // Игнорируем ошибки трекинга
        console.error('Failed to track visit:', error);
      }
    };

    trackVisit();
  }, [pathname]);

  return null; // Компонент ничего не рендерит
}
