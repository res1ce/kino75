'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  EmptyState,
  LoadingState,
  PageHero,
  ScaleIcon,
  SearchIcon,
  easeOut,
} from '../_components/BrandPrimitives';

interface ProsecutorExplanation {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface ProsecutorResponse {
  data: ProsecutorExplanation[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ProsecutorPage() {
  const [selectedExplanation, setSelectedExplanation] = useState<ProsecutorExplanation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useSWR<ProsecutorResponse>('/api/prosecutor?limit=100', fetcher);
  const explanations = data?.data || [];

  const filteredExplanations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return explanations;

    return explanations.filter((item) =>
      item.title.toLowerCase().includes(query) ||
      (item.excerpt || '').toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query)
    );
  }, [explanations, searchQuery]);

  useEffect(() => {
    const selectedStillVisible = filteredExplanations.some((item) => item.id === selectedExplanation?.id);
    if (!selectedStillVisible) {
      setSelectedExplanation(filteredExplanations[0] || null);
    }
  }, [filteredExplanations, selectedExplanation?.id]);

  if (isLoading) {
    return <LoadingState label="Загрузка разъяснений..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        eyebrow="Правовые разъяснения"
        title="Прокурор разъясняет"
        description="Понятные материалы по актуальным вопросам законодательства, профилактике нарушений и защите прав граждан."
        icon={<ScaleIcon />}
      />

      <section className="py-10 md:py-14 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.35fr] gap-5">
            <motion.aside
              className="cinema-card overflow-hidden"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.62, ease: easeOut }}
            >
              <div className="p-5 border-b border-border">
                <h2 className="text-xl font-black text-foreground">Разъяснения</h2>
              </div>
              <div className="p-5 border-b border-border relative">
                <SearchIcon className="absolute left-9 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Поиск разъяснений..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="soft-input pl-11 pr-4 py-2 text-sm"
                />
              </div>
              <div className="max-h-[620px] overflow-y-auto">
                {filteredExplanations.length > 0 ? (
                  filteredExplanations.map((item, index) => (
                    <button
                      key={`${searchQuery}-${item.id}`}
                      onClick={() => setSelectedExplanation(item)}
                      className={`w-full text-left p-5 border-b border-border last:border-b-0 hover:bg-secondary ${
                        selectedExplanation?.id === item.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.36, delay: Math.min(index * 0.025, 0.16), ease: easeOut }}
                      >
                        <h3 className="font-black text-foreground text-sm line-clamp-2">{item.title}</h3>
                        {item.excerpt && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{item.excerpt}</p>}
                        <time className="mt-3 block text-xs text-muted-foreground">{formatDate(item.publishedAt)}</time>
                      </motion.div>
                    </button>
                  ))
                ) : (
                  <div className="p-5">
                    <EmptyState label="Ничего не найдено" />
                  </div>
                )}
              </div>
            </motion.aside>

            <motion.article
              className="cinema-card overflow-hidden min-h-[620px]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.62, ease: easeOut, delay: 0.1 }}
            >
              {selectedExplanation ? (
                <>
                  <div className="p-6 border-b border-border">
                    <h1 className="text-2xl md:text-3xl font-black text-foreground">{selectedExplanation.title}</h1>
                    <time className="mt-3 block text-sm text-muted-foreground">
                      {formatDate(selectedExplanation.publishedAt)}
                    </time>
                  </div>
                  <div
                    className="p-6 prose prose-lg dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedExplanation.content }}
                  />
                </>
              ) : (
                <div className="min-h-[620px] flex items-center justify-center p-8 text-center">
                  <div>
                    <ScaleIcon className="w-16 h-16 mx-auto text-primary/70" />
                    <p className="mt-4 text-muted-foreground">Выберите разъяснение из списка</p>
                  </div>
                </div>
              )}
            </motion.article>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-[#f0f0ed]">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.62, ease: easeOut }}
          >
            <h2 className="text-2xl md:text-4xl font-black text-foreground">Горячая линия прокуратуры</h2>
            <p className="mt-4 text-muted-foreground">
              По вопросам противодействия коррупции и защиты прав предпринимателей.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
              <a href="tel:+74959875656" className="btn-primary px-6 py-3">+7 (495) 987-56-56</a>
              <Link href="https://epp.genproc.gov.ru" target="_blank" className="btn-secondary px-6 py-3">
                Интернет-приёмная
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
