'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import {
  ArrowIcon,
  EmptyState,
  FilterButton,
  LoadingState,
  NewsIcon,
  PageHero,
  easeOut,
} from '../_components/BrandPrimitives';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  imageUrl?: string | null;
  published: boolean;
  publishedAt: string;
  createdAt: string;
}

interface NewsResponse {
  data: NewsItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const months = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NewsPage() {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const { data: newsResponse, isLoading } = useSWR<NewsResponse>('/api/news?published=true', fetcher);
  const newsData = newsResponse?.data || [];
  const years = [...new Set(newsData.map((item) => new Date(item.publishedAt).getFullYear()))].sort((a, b) => b - a);

  const filteredNews = newsData.filter((news) => {
    const date = new Date(news.publishedAt);
    if (selectedMonth !== null && date.getMonth() !== selectedMonth) return false;
    if (selectedYear !== null && date.getFullYear() !== selectedYear) return false;
    return true;
  });

  if (isLoading) {
    return <LoadingState label="Загрузка новостей..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        eyebrow="Хроника кинокомпании"
        title="Новости и события"
        description="Премьеры, съёмки, фестивали и рабочие обновления из жизни Забайкальской государственной кинокомпании."
        icon={<NewsIcon />}
      />

      <section className="border-y border-border bg-white px-4 py-4">
        <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            onClick={() => setArchiveOpen((value) => !value)}
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary w-fit"
          >
            <svg className={`w-4 h-4 ${archiveOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Архив новостей
          </button>
          {(selectedMonth !== null || selectedYear !== null) && (
            <button
              onClick={() => {
                setSelectedMonth(null);
                setSelectedYear(null);
              }}
              className="text-sm font-bold text-primary hover:text-accent w-fit"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      </section>

      <AnimatePresence>
        {archiveOpen && (
          <motion.section
            className="px-4 py-7 bg-secondary border-b border-border"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.34, ease: easeOut }}
          >
            <div className="container mx-auto max-w-7xl">
              <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
                <div>
                  <h3 className="text-sm font-black text-foreground mb-3">Год</h3>
                  <div className="flex flex-wrap gap-2">
                    {years.map((year) => (
                      <FilterButton key={year} active={selectedYear === year} onClick={() => setSelectedYear(selectedYear === year ? null : year)}>
                        {year}
                      </FilterButton>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground mb-3">Месяц</h3>
                  <div className="flex flex-wrap gap-2">
                    {months.map((month, index) => (
                      <FilterButton key={month} active={selectedMonth === index} onClick={() => setSelectedMonth(selectedMonth === index ? null : index)}>
                        {month}
                      </FilterButton>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {filteredNews.length > 0 ? (
            <div
              key={`${selectedYear ?? 'all'}-${selectedMonth ?? 'all'}`}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            >
              {filteredNews.map((news, index) => (
                <motion.article
                  key={news.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.42, delay: Math.min(index * 0.035, 0.18), ease: easeOut }}
                  whileHover={{ y: -6 }}
                  className="cinema-card group overflow-hidden"
                >
                  <Link href={`/news/${news.slug}`} className="block h-full">
                    <div className="aspect-video bg-[#e6e6e3] overflow-hidden relative">
                      {news.imageUrl ? (
                        <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 film-strip flex items-center justify-center text-primary/70">
                          <NewsIcon className="w-16 h-16" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <time className="text-sm text-muted-foreground">
                        {new Date(news.publishedAt).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </time>
                      <h2 className="mt-3 text-xl font-black text-foreground group-hover:text-primary line-clamp-2">
                        {news.title}
                      </h2>
                      {news.excerpt && (
                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {news.excerpt}
                        </p>
                      )}
                      <div className="mt-5 inline-flex items-center gap-2 text-primary font-bold text-sm group-hover:text-accent">
                        Читать далее
                        <ArrowIcon className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          ) : (
            <EmptyState label="Новости не найдены" />
          )}
        </div>
      </section>
    </div>
  );
}
