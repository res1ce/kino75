'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import useSWR from 'swr';
import {
  DownloadIcon,
  EmptyState,
  FilterButton,
  LoadingState,
  PageHero,
  SearchIcon,
  ShieldIcon,
  easeOut,
} from '../_components/BrandPrimitives';

interface AntiCorruptionDocument {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileName: string;
  fileSize?: number | null;
  category?: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface AntiCorruptionResponse {
  data: AntiCorruptionDocument[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatFileSize(bytes?: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getDownloadUrl(fileUrl: string) {
  try {
    const url = new URL(fileUrl);
    if (url.pathname.startsWith('/uploads/')) {
      return url.pathname;
    }
  } catch {
    return fileUrl;
  }

  return fileUrl;
}

export default function AntiCorruptionPage() {
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useSWR<AntiCorruptionResponse>('/api/anti-corruption?limit=100', fetcher);
  const documents = data?.data || [];
  const categories = ['Все', ...new Set(documents.map((doc) => doc.category).filter(Boolean) as string[])];

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'Все' || doc.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      doc.title.toLowerCase().includes(query) ||
      (doc.description || '').toLowerCase().includes(query) ||
      (doc.category || '').toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return <LoadingState label="Загрузка документов..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        eyebrow="Открытые документы"
        title="Противодействие коррупции"
        description="Нормативные акты, методические материалы и контакты для обращений по вопросам антикоррупционной политики."
        icon={<ShieldIcon />}
      />

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="cinema-card p-6 md:p-8"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: easeOut }}
          >
            <h2 className="text-2xl md:text-3xl font-black text-foreground">
              Информация о противодействии коррупции
            </h2>
            <div className="mt-5 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Забайкальская государственная кинокомпания придерживается принципов нулевой терпимости к коррупции и реализует меры предупреждения в соответствии с законодательством Российской Федерации.
              </p>
              <p>
                На этой странице размещены нормативно-правовые акты, рекомендации и документы, регулирующие вопросы противодействия коррупции.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-14 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.56, ease: easeOut }}
          >
            <div className="relative mb-4">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Поиск документов..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="soft-input pl-12 pr-4 py-3"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <FilterButton key={category} active={selectedCategory === category} onClick={() => setSelectedCategory(category)}>
                  {category}
                </FilterButton>
              ))}
            </div>
          </motion.div>

          {filteredDocuments.length > 0 ? (
            <div className="space-y-4">
              {filteredDocuments.map((doc, index) => (
                <motion.article
                  key={`${selectedCategory}-${searchQuery}-${doc.id}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.42, delay: Math.min(index * 0.035, 0.18), ease: easeOut }}
                  className="cinema-card p-5 md:p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {doc.category && (
                          <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-black">
                            {doc.category}
                          </span>
                        )}
                        <time className="text-xs text-muted-foreground">{formatDate(doc.publishedAt)}</time>
                      </div>
                      <h3 className="text-lg md:text-xl font-black text-foreground">{doc.title}</h3>
                      {doc.description && <p className="mt-2 text-sm text-muted-foreground">{doc.description}</p>}
                    </div>
                    <a
                      href={getDownloadUrl(doc.fileUrl)}
                      download={doc.fileName}
                      className="btn-primary px-6 py-3 whitespace-nowrap"
                    >
                      <DownloadIcon />
                      Скачать
                      {doc.fileSize ? <span className="text-xs opacity-75">{formatFileSize(doc.fileSize)}</span> : null}
                    </a>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <EmptyState label="Документы не найдены" />
          )}
        </div>
      </section>

      <section className="py-12 px-4 bg-[#f0f0ed]">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="rounded-lg border border-border bg-gradient-to-r from-primary to-accent p-8 md:p-10 text-white shadow-[0_18px_46px_rgba(17,17,17,0.16)]"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, ease: easeOut }}
          >
            <h2 className="text-2xl md:text-3xl font-black">Сообщить о факте коррупции</h2>
            <p className="mt-4 max-w-3xl font-medium">
              Если вам стало известно о факте коррупции, вы можете сообщить об этом по указанным контактам.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 font-black">
              <a href="tel:+74959875656" className="hover:underline">
                Телефон «горячей линии» прокуратуры России: +7 (495) 987-56-56
              </a>
              <a href="tel:88001001260" className="hover:underline">
                Телефон доверия Следственного управления Следственного комитета России: 8-800-100-12-60
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
