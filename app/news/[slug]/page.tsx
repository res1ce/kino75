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
      <section className="brand-hero film-grain py-14 md:py-20 px-4">
        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: easeOut }}
          >
            <Link href="/news" className="inline-flex items-center gap-2 text-primary font-bold hover:text-accent mb-8">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Назад к новостям
            </Link>
            <time className="section-kicker mb-5">
              {new Date(news.publishedAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
            <h1 className="text-3xl md:text-5xl font-black text-foreground leading-tight max-w-4xl">
              {news.title}
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-10 md:py-14 px-4">
        <div className="container mx-auto max-w-4xl">
          {news.imageUrl && (
            <motion.img
              src={news.imageUrl}
              alt={news.title}
              className="w-full aspect-video object-cover rounded-lg border border-border mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.62, ease: easeOut }}
            />
          )}
          <motion.article
            className="prose prose-lg dark:prose-invert max-w-none cinema-card p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, ease: easeOut, delay: 0.1 }}
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </div>
      </section>
    </div>
  );
}
