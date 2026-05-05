'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  DownloadIcon,
  EmptyState,
  FilterButton,
  PageHero,
  SearchIcon,
  ShieldIcon,
  easeOut,
  reveal,
  stagger,
} from '../_components/BrandPrimitives';

const documentsData = [
  {
    id: '1',
    title: 'Федеральный закон № 273-ФЗ "О противодействии коррупции"',
    description: 'Основной федеральный закон, регулирующий вопросы противодействия коррупции в РФ',
    fileName: '273-FZ.pdf',
    fileSize: 245000,
    category: 'Федеральные законы',
    publishedAt: '2023-12-25',
  },
  {
    id: '2',
    title: 'Федеральный закон № 79-ФЗ "О государственной гражданской службе"',
    description: 'Закон о государственной гражданской службе Российской Федерации',
    fileName: '79-FZ.pdf',
    fileSize: 312000,
    category: 'Федеральные законы',
    publishedAt: '2023-11-15',
  },
  {
    id: '3',
    title: 'Указ Президента РФ № 378 "О национальной стратегии противодействия коррупции"',
    description: 'Национальная стратегия противодействия коррупции на период до 2030 года',
    fileName: 'ukaz-378.pdf',
    fileSize: 189000,
    category: 'Указы Президента',
    publishedAt: '2023-10-20',
  },
  {
    id: '4',
    title: 'Постановление Правительства РФ о комиссиях по соблюдению требований',
    description: 'Положение о комиссиях по соблюдению требований к служебному поведению',
    fileName: 'postanovlenie.pdf',
    fileSize: 156000,
    category: 'Постановления',
    publishedAt: '2023-09-10',
  },
  {
    id: '5',
    title: 'Методические рекомендации по противодействию коррупции',
    description: 'Рекомендации для организаций кинематографии',
    fileName: 'metodichka.pdf',
    fileSize: 423000,
    category: 'Методические материалы',
    publishedAt: '2023-08-05',
  },
];

const categories = ['Все', 'Федеральные законы', 'Указы Президента', 'Постановления', 'Методические материалы'];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export default function AntiCorruptionPage() {
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = documentsData.filter((doc) => {
    const matchesCategory = selectedCategory === 'Все' || doc.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch = doc.title.toLowerCase().includes(query) || doc.description?.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

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
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div variants={reveal} transition={{ duration: 0.6, ease: easeOut }} className="relative mb-4">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Поиск документов..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="soft-input pl-12 pr-4 py-3"
              />
            </motion.div>
            <motion.div variants={reveal} transition={{ duration: 0.6, ease: easeOut }} className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <FilterButton key={category} active={selectedCategory === category} onClick={() => setSelectedCategory(category)}>
                  {category}
                </FilterButton>
              ))}
            </motion.div>
          </motion.div>

          {filteredDocuments.length > 0 ? (
            <motion.div
              className="space-y-4"
              initial="initial"
              animate="animate"
              variants={stagger}
            >
              {filteredDocuments.map((doc) => (
                <motion.article
                  key={doc.id}
                  variants={reveal}
                  transition={{ duration: 0.58, ease: easeOut }}
                  className="cinema-card p-5 md:p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-black">
                          {doc.category}
                        </span>
                        <time className="text-xs text-muted-foreground">
                          {new Date(doc.publishedAt).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                      </div>
                      <h3 className="text-lg md:text-xl font-black text-foreground">{doc.title}</h3>
                      {doc.description && <p className="mt-2 text-sm text-muted-foreground">{doc.description}</p>}
                    </div>
                    <a
                      href={`/uploads/anti-corruption/${doc.fileName}`}
                      download
                      className="btn-primary px-6 py-3 whitespace-nowrap"
                    >
                      <DownloadIcon />
                      Скачать
                      <span className="text-xs opacity-75">{formatFileSize(doc.fileSize)}</span>
                    </a>
                  </div>
                </motion.article>
              ))}
            </motion.div>
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
              <a href="mailto:anticorruption@kino75.ru" className="hover:underline">anticorruption@kino75.ru</a>
              <a href="tel:+73022000000" className="hover:underline">+7 (3022) 00-00-00</a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
