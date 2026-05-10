'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowIcon, LoadingState, easeOut, reveal, stagger } from '../_components/BrandPrimitives';

const menuItems = [
  { href: '/admin/news', label: 'Новости', marker: 'N', description: 'Управление публикациями и архивом' },
  { href: '/admin/about', label: 'О нас', marker: 'O', description: 'Текст о компании и сотрудники' },
  { href: '/admin/cinemas', label: 'Кинотеатры', marker: 'K', description: 'Площадки, адреса и контакты' },
  { href: '/admin/services', label: 'Услуги', marker: 'S', description: 'Каталог услуг и стоимость' },
  { href: '/admin/anti-corruption', label: 'Противодействие коррупции', marker: 'A', description: 'Файлы и нормативные материалы' },
  { href: '/admin/prosecutor', label: 'Прокурор разъясняет', marker: 'P', description: 'Правовые разъяснения' },
  { href: '/admin/home', label: 'Главная страница', marker: 'H', description: 'Тексты первого экрана и статистика' },
  { href: '/admin/statistics', label: 'Статистика', marker: 'D', description: 'Аналитика посещений' },
];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <LoadingState label="Загрузка панели..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-white/92 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-primary text-white flex items-center justify-center font-black">
              75
            </div>
            <div className="hidden sm:block">
              <div className="font-black text-foreground">Админ-панель</div>
              <div className="text-xs text-muted-foreground">Забайкальская кинокомпания</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-muted-foreground">{session?.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-9">
        <motion.div initial="initial" animate="animate" variants={stagger} className="mb-9">
          <motion.div variants={reveal} transition={{ duration: 0.62, ease: easeOut }} className="section-kicker mb-4">
            Рабочий стол
          </motion.div>
          <motion.h1 variants={reveal} transition={{ duration: 0.62, ease: easeOut }} className="text-3xl md:text-5xl font-black text-foreground">
            Панель управления
          </motion.h1>
          <motion.p variants={reveal} transition={{ duration: 0.62, ease: easeOut }} className="mt-3 text-muted-foreground">
            Выберите раздел для редактирования контента сайта.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          {menuItems.map((item) => (
            <motion.div key={item.href} variants={reveal} transition={{ duration: 0.58, ease: easeOut }} whileHover={{ y: -6 }}>
              <Link href={item.href} className="cinema-card group block p-6 h-full">
                <div className="flex items-start justify-between gap-5">
                  <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black">
                    {item.marker}
                  </div>
                  <ArrowIcon className="w-5 h-5 text-muted-foreground group-hover:text-accent" />
                </div>
                <h2 className="mt-7 text-xl font-black text-foreground group-hover:text-primary">{item.label}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-5"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          {[
            { label: 'Новостей', value: '24' },
            { label: 'Кинотеатров', value: '15' },
            { label: 'Услуг', value: '8' },
            { label: 'Документов', value: '32' },
          ].map((stat) => (
            <motion.div key={stat.label} variants={reveal} transition={{ duration: 0.58, ease: easeOut }} className="cinema-card p-5 text-center">
              <div className="text-3xl font-black text-primary">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
