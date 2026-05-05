'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useAccessibility } from '@/lib/accessibility';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Главная' },
  { href: '/cinemas', label: 'Кинотеатры' },
  { href: '/news', label: 'Новости' },
  { href: '/services', label: 'Услуги' },
  { href: '/anti-corruption', label: 'Противодействие коррупции' },
  { href: '/prosecutor', label: 'Прокурор разъясняет' },
];

export default function Header() {
  const { fontSize, setFontSize, highContrast, toggleHighContrast } = useAccessibility();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'bg-white/92 backdrop-blur-xl border-black/12 shadow-[0_12px_30px_rgba(17,17,17,0.08)]'
          : 'bg-white/82 backdrop-blur-md border-black/10'
      }`}
    >
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-fuchsia-400" />
      <nav className="container mx-auto px-4 md:px-6">
        <div className="h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0" onClick={() => setMobileMenuOpen(false)}>
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="w-11 h-11 rounded-lg bg-primary text-white flex items-center justify-center font-black shadow-[0_12px_24px_rgba(17,17,17,0.2)]"
            >
              75
            </motion.div>
            <div className="hidden sm:block leading-tight">
              <div className="text-sm font-black text-foreground">Забайкальская</div>
              <div className="text-xs text-muted-foreground uppercase">кинокомпания</div>
            </div>
          </Link>

          <div className="hidden xl:flex items-center justify-center flex-1">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Link
                    href={item.href}
                    className={`relative px-3 py-5 text-sm font-bold transition-colors ${
                      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute left-3 right-3 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-primary to-accent transition-transform duration-250 ${
                        isActive ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <div className="hidden md:flex items-center gap-1 rounded-lg border border-border bg-secondary p-1">
              {(['normal', 'large', 'xlarge'] as const).map((size, index) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`h-8 min-w-8 rounded-md text-xs font-black ${
                    fontSize === size ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={{ fontSize: index === 0 ? '10px' : index === 1 ? '12px' : '14px' }}
                >
                  A
                </button>
              ))}
            </div>

            <button
              onClick={toggleHighContrast}
              title="Версия для слабовидящих"
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                highContrast ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>

            <button
              onClick={() => setMobileMenuOpen((value) => !value)}
              className="xl:hidden w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary"
              aria-label="Открыть меню"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.26 }}
              className="xl:hidden overflow-hidden border-t border-border"
            >
              <div className="py-3 grid gap-1">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.035 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-bold ${
                          isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`}
                      >
                        {item.label}
                        {isActive && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </Link>
                    </motion.div>
                  );
                })}
                <div className="md:hidden px-4 pt-3 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Размер текста</span>
                  {(['normal', 'large', 'xlarge'] as const).map((size, index) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`h-8 min-w-8 rounded-md text-xs font-black ${
                        fontSize === size ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                      }`}
                      style={{ fontSize: index === 0 ? '10px' : index === 1 ? '12px' : '14px' }}
                    >
                      A
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
