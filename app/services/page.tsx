'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import useSWR from 'swr';
import {
  ArrowIcon,
  EmptyState,
  FilterButton,
  LoadingState,
  PageHero,
  ServiceIcon,
  easeOut,
} from '../_components/BrandPrimitives';

interface Service {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  price: number;
  unit?: string | null;
  category?: string | null;
  active: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatPrice(price: number): string {
  return `${price.toLocaleString('ru-RU')} ₽`;
}

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const { data: services, isLoading } = useSWR<Service[]>('/api/services?active=true', fetcher);
  const categories = services ? ['Все', ...new Set(services.map((service) => service.category).filter(Boolean) as string[])] : ['Все'];
  const filteredServices = services?.filter((service) => selectedCategory === 'Все' || service.category === selectedCategory) || [];

  if (isLoading) {
    return <LoadingState label="Загрузка услуг..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        eyebrow="Производственный центр"
        title="Услуги кинокомпании"
        description="Помогаем запустить съёмки, подготовить событие, организовать показ и довести кинопроект до зрителя."
        icon={<ServiceIcon />}
      />

      <section className="py-7 px-4 border-b border-border bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <FilterButton key={category} active={selectedCategory === category} onClick={() => setSelectedCategory(category)}>
                {category}
              </FilterButton>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {filteredServices.length > 0 ? (
            <div
              key={selectedCategory}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            >
              {filteredServices.map((service, index) => (
                <motion.article
                  key={service.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.42, delay: Math.min(index * 0.035, 0.18), ease: easeOut }}
                  whileHover={{ y: -6 }}
                  className="cinema-card group relative overflow-hidden p-6 cursor-pointer"
                  onClick={() => setSelectedService(service)}
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-fuchsia-400 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300" />
                  <div className="flex items-start justify-between gap-4">
                    {service.category && (
                      <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-black">
                        {service.category}
                      </span>
                    )}
                    <ServiceIcon className="w-7 h-7 text-accent" />
                  </div>
                  <h2 className="mt-7 text-xl font-black text-foreground group-hover:text-primary">
                    {service.title}
                  </h2>
                  {service.description && (
                    <p className="mt-3 min-h-[64px] text-sm text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  )}
                  <div className="mt-7 flex items-end justify-between gap-4">
                    <div>
                      <div className="text-3xl font-black text-primary">{formatPrice(service.price)}</div>
                      {service.unit && <div className="text-sm text-muted-foreground">за {service.unit}</div>}
                    </div>
                    <button className="btn-secondary px-4 py-2 text-sm">
                      Подробнее
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <EmptyState label="Услуги в данной категории не найдены" />
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedService && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/35 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              className="cinema-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.28, ease: easeOut }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="p-6 border-b border-border sticky top-0 bg-card backdrop-blur-md z-10 flex items-start justify-between gap-5">
                <div>
                  {selectedService.category && <div className="section-kicker mb-3">{selectedService.category}</div>}
                  <h2 className="text-2xl md:text-3xl font-black text-foreground">{selectedService.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="w-10 h-10 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center"
                  aria-label="Закрыть"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                {selectedService.description && (
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {selectedService.description}
                  </p>
                )}

                <div className="rounded-lg border border-border bg-secondary p-5 mb-6">
                  <h3 className="font-black text-foreground mb-3">Стоимость</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-primary">{formatPrice(selectedService.price)}</span>
                    {selectedService.unit && <span className="text-muted-foreground">/ {selectedService.unit}</span>}
                  </div>
                </div>

                <ul className="space-y-3 mb-7">
                  <li className="flex gap-3 text-muted-foreground">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    Индивидуальное уточнение состава работ и сроков.
                  </li>
                  <li className="flex gap-3 text-muted-foreground">
                    <span className="mt-1 h-2 w-2 rounded-full bg-accent flex-shrink-0" />
                    Возможна подготовка предложения под конкретный проект.
                  </li>
                </ul>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="tel:+73022000000" className="btn-primary flex-1 px-6 py-3">
                    Заказать
                    <ArrowIcon className="w-5 h-5" />
                  </a>
                  <button onClick={() => setSelectedService(null)} className="btn-secondary px-6 py-3">
                    Закрыть
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
