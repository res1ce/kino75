'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import {
  EmptyState,
  PageHero,
  ScaleIcon,
  SearchIcon,
  easeOut,
} from '../_components/BrandPrimitives';

const explanationsData = [
  {
    id: '1',
    title: 'Ответственность за дачу взятки',
    slug: 'otvetstvennost-za-dachu-vzyatki',
    content: `
      <p>Дача взятки должностному лицу влечёт ответственность, предусмотренную уголовным законодательством Российской Федерации.</p>
      <h3>Возможные последствия</h3>
      <ul>
        <li>штраф;</li>
        <li>лишение права занимать определённые должности;</li>
        <li>ограничение или лишение свободы в зависимости от обстоятельств дела.</li>
      </ul>
      <p>При возникновении спорной ситуации рекомендуется обращаться за профессиональной юридической консультацией.</p>
    `,
    excerpt: 'Краткое разъяснение об ответственности за коррупционные действия.',
    publishedAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Коррупционные правонарушения на государственной службе',
    slug: 'korruptsionnye-pravonarusheniya',
    content: `
      <p>Государственные и муниципальные служащие обязаны соблюдать установленные запреты, ограничения и требования к служебному поведению.</p>
      <h3>К ключевым обязанностям относятся</h3>
      <ul>
        <li>предотвращение конфликта интересов;</li>
        <li>уведомление о личной заинтересованности;</li>
        <li>недопущение использования служебного положения в личных целях.</li>
      </ul>
    `,
    excerpt: 'Обзор типовых нарушений и обязанностей служащих.',
    publishedAt: '2024-01-10',
  },
  {
    id: '3',
    title: 'Порядок уведомления о склонении к коррупции',
    slug: 'uvedomlenie-o-sklonenii-k-korruptsii',
    content: `
      <p>Работники организаций обязаны уведомлять работодателя о фактах обращения к ним с целью склонения к коррупционным правонарушениям.</p>
      <h3>Рекомендуемый порядок действий</h3>
      <ol>
        <li>зафиксировать обстоятельства обращения;</li>
        <li>сообщить непосредственному руководителю;</li>
        <li>передать письменное уведомление в установленном порядке.</li>
      </ol>
    `,
    excerpt: 'Что делать, если работника склоняют к неправомерным действиям.',
    publishedAt: '2024-01-05',
  },
  {
    id: '4',
    title: 'Конфликт интересов',
    slug: 'konflikt-interesov',
    content: `
      <p>Конфликт интересов возникает, когда личная заинтересованность может повлиять на объективное исполнение должностных обязанностей.</p>
      <h3>Примеры ситуаций</h3>
      <ul>
        <li>финансовая заинтересованность в решении;</li>
        <li>родственные связи в подчинённой организации;</li>
        <li>получение подарков или услуг от заинтересованных лиц.</li>
      </ul>
    `,
    excerpt: 'Как распознать конфликт интересов и почему о нём нужно сообщать.',
    publishedAt: '2023-12-20',
  },
  {
    id: '5',
    title: 'Антикоррупционная экспертиза нормативных актов',
    slug: 'antikorruptsionnaya-ekspertiza',
    content: `
      <p>Антикоррупционная экспертиза помогает выявлять положения, которые могут способствовать коррупционным рискам.</p>
      <h3>На что обращают внимание</h3>
      <ul>
        <li>неопределённые полномочия;</li>
        <li>избыточные требования к заявителям;</li>
        <li>отсутствие прозрачных процедур.</li>
      </ul>
    `,
    excerpt: 'Зачем проводится экспертиза и какие риски она помогает увидеть.',
    publishedAt: '2023-12-15',
  },
];

export default function ProsecutorPage() {
  const [selectedExplanation, setSelectedExplanation] = useState<(typeof explanationsData)[number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExplanations = explanationsData.filter((item) => {
    const query = searchQuery.toLowerCase();
    return item.title.toLowerCase().includes(query) || item.excerpt.toLowerCase().includes(query);
  });

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
                      key={item.id}
                      onClick={() => setSelectedExplanation(item)}
                      className={`w-full text-left p-5 border-b border-border last:border-b-0 hover:bg-secondary ${
                        selectedExplanation?.id === item.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: 14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.46, delay: index * 0.04 }}
                      >
                        <h3 className="font-black text-foreground text-sm line-clamp-2">{item.title}</h3>
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{item.excerpt}</p>
                        <time className="mt-3 block text-xs text-muted-foreground">
                          {new Date(item.publishedAt).toLocaleDateString('ru-RU')}
                        </time>
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
                      {new Date(selectedExplanation.publishedAt).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
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
              <a href="tel:+73022000000" className="btn-primary px-6 py-3">+7 (3022) 00-00-00</a>
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
