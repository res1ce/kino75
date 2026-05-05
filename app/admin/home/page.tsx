'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import useSWR from 'swr';

interface HomePageData {
  hero_title: string;
  hero_subtitle: string;
  about_title: string;
  about_content: string;
  stats_years_value: string;
  stats_years_label: string;
  stats_films_value: string;
  stats_films_label: string;
  stats_cinemas_value: string;
  stats_cinemas_label: string;
  stats_viewers_value: string;
  stats_viewers_label: string;
}

interface EditableField {
  key: keyof HomePageData;
  label: string;
  section: string;
  type?: 'text' | 'textarea';
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const fields: EditableField[] = [
  { key: 'hero_title', label: 'Заголовок', section: 'hero' },
  { key: 'hero_subtitle', label: 'Подзаголовок', section: 'hero' },
  { key: 'about_title', label: 'Заголовок раздела', section: 'about', type: 'text' },
  { key: 'about_content', label: 'Основной текст', section: 'about', type: 'textarea' },
  { key: 'stats_years_value', label: 'Значение: лет истории', section: 'stats', type: 'text' },
  { key: 'stats_years_label', label: 'Подпись: лет истории', section: 'stats', type: 'text' },
  { key: 'stats_films_value', label: 'Значение: фильмов', section: 'stats', type: 'text' },
  { key: 'stats_films_label', label: 'Подпись: фильмов', section: 'stats', type: 'text' },
  { key: 'stats_cinemas_value', label: 'Значение: кинотеатров', section: 'stats', type: 'text' },
  { key: 'stats_cinemas_label', label: 'Подпись: кинотеатров', section: 'stats', type: 'text' },
  { key: 'stats_viewers_value', label: 'Значение: зрителей', section: 'stats', type: 'text' },
  { key: 'stats_viewers_label', label: 'Подпись: зрителей', section: 'stats', type: 'text' },
];

const sections = [
  { id: 'hero', title: 'Главный экран', icon: '🎬' },
  { id: 'about', title: 'О компании', icon: 'ℹ️' },
  { id: 'stats', title: 'Статистика', icon: '📊' },
];

export default function AdminHomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [editingField, setEditingField] = useState<{ key: string; value: string; label: string } | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    hero: true,
    about: true,
    stats: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: homeData, mutate } = useSWR<HomePageData>('/api/home', fetcher);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  const handleSave = async () => {
    if (!editingField) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ key: editingField.key, value: editingField.value }]),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при сохранении');
      }

      await mutate();
      setEditingField(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const getFieldsBySection = (section: string) => fields.filter(f => f.section === section);

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center"><div className="text-muted-foreground">Загрузка...</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-semibold">Назад</span>
            </Link>
            <h1 className="text-xl font-bold">Главная страница</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-secondary border border-border rounded-lg text-foreground">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-secondary border border-border rounded-lg text-foreground">
            Сохранено успешно!
          </div>
        )}

        <div className="space-y-6">
          {sections.map((section) => {
            const sectionFields = getFieldsBySection(section.id);
            const isOpen = openSections[section.id];

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-lg border border-border overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{section.icon}</span>
                    <span className="font-semibold text-foreground">{section.title}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border"
                    >
                      <div className="p-6 space-y-4">
                        {sectionFields.map((field) => {
                          const value = homeData?.[field.key] || '';
                          return (
                            <div key={field.key} className="bg-secondary/50 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="text-sm font-medium text-primary mb-1">{field.label}</h3>
                                  <p className="text-foreground text-sm whitespace-pre-line line-clamp-2">{value}</p>
                                </div>
                                <button
                                  onClick={() => setEditingField({ key: field.key, value, label: field.label })}
                                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {editingField && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setEditingField(null)}
          >
            <div
              className="bg-card rounded-lg border border-border max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-4">Редактировать</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Поле</label>
                  <input
                    type="text"
                    value={editingField.label}
                    disabled
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-lg opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Значение</label>
                  <textarea
                    value={editingField.value}
                    onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-lg"
                    rows={editingField.key.includes('content') ? 6 : 3}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Сохранение...' : 'Сохранить'}
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-secondary hover:bg-muted text-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
