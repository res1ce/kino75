'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { ArrowIcon, LoadingState, NewsIcon, easeOut } from '../../_components/BrandPrimitives';

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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function NewsSlugPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { data: news, error, isLoading } = useSWR<NewsItem>(`/api/news/${slug}`, fetcher);

  if (isLoading) {
    return <LoadingState label="Загрузка новости..." />;
  }

  if (error || !news) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="cinema-card p-8 text-center max-w-md">
          <NewsIcon className="w-14 h-14 mx-auto text-primary" />
          <h1 className="mt-4 text-2xl font-black text-foreground">Новость не найдена</h1>
          <Link href="/news" className="mt-5 inline-flex items-center gap-2 text-primary font-bold hover:text-accent">
            Вернуться к новостям
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="brand-hero film-grain px-4 pt-10 pb-9 md:pt-14 md:pb-12">
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: easeOut }}
          >
            <Link href="/news" className="inline-flex items-center gap-2 text-primary font-bold hover:text-accent mb-7">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Назад к новостям
            </Link>

            <div className={`grid gap-7 md:gap-9 items-end ${news.imageUrl ? 'lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)]' : ''}`}>
              <div className="min-w-0">
                <time className="section-kicker mb-5">
                  {formatDate(news.publishedAt)}
                </time>
                <h1 className="text-3xl md:text-5xl xl:text-6xl font-black text-foreground leading-[1.05]">
                  {news.title}
                </h1>
                {news.excerpt && (
                  <p className="mt-6 max-w-3xl text-lg text-muted-foreground leading-relaxed">
                    {news.excerpt}
                  </p>
                )}
              </div>

              {news.imageUrl && (
                <motion.figure
                  className="relative overflow-hidden rounded-lg border border-border bg-secondary shadow-[0_18px_46px_rgba(17,17,17,0.12)]"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.62, ease: easeOut, delay: 0.08 }}
                >
                  <img
                    src={news.imageUrl}
                    alt={news.title}
                    className="w-full aspect-[16/10] object-cover"
                  />
                </motion.figure>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-9 md:py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-6 lg:gap-10 items-start">
            <motion.aside
              className="hidden lg:block sticky top-28"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOut, delay: 0.08 }}
            >
              <div className="border-t border-border pt-5 text-sm text-muted-foreground">
                <div className="font-black text-foreground">Новость</div>
                <time className="mt-2 block">{formatDate(news.publishedAt)}</time>
                <Link href="/news" className="mt-6 inline-flex items-center gap-2 font-bold text-primary hover:text-accent">
                  Все новости
                  <ArrowIcon className="w-4 h-4" />
                </Link>
              </div>
            </motion.aside>

          <motion.article
            className="news-detail-content prose prose-lg dark:prose-invert max-w-none rounded-lg border border-border bg-white p-6 md:p-10 xl:p-12 shadow-[0_16px_40px_rgba(17,17,17,0.07)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, ease: easeOut, delay: 0.1 }}
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
          </div>
        </div>
      </section>
    </div>
  );
}
