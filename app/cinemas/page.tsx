'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import {
  CinemaIcon,
  EmptyState,
  LoadingState,
  PageHero,
  easeOut,
  reveal,
  stagger,
} from '../_components/BrandPrimitives';

interface Cinema {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  link?: string | null;
  phone?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  active: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type YMapInstance = {
  geoObjects: { add: (object: unknown) => void };
  destroy: () => void;
};

type YClusterer = {
  add: (placemarks: unknown[]) => void;
};

type YPlacemark = {
  events: { add: (eventName: string, handler: () => void) => void };
};

type YMapsApi = {
  ready: (handler: () => void) => void;
  Map: new (elementId: string, options: Record<string, unknown>) => YMapInstance;
  Clusterer: new (options: Record<string, unknown>) => YClusterer;
  Placemark: new (
    coordinates: [number, number],
    properties: Record<string, unknown>,
    options: Record<string, unknown>
  ) => YPlacemark;
};

declare global {
  interface Window {
    ymaps?: YMapsApi;
  }
}

export default function CinemasPage() {
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<YMapInstance | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const { data: cinemas, isLoading } = useSWR<Cinema[]>('/api/cinemas?active=true', fetcher);

  useEffect(() => {
    const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]');

    if (window.ymaps) {
      const timer = window.setTimeout(() => setMapLoaded(true), 0);
      return () => window.clearTimeout(timer);
    }

    if (existingScript) {
      const handleLoad = () => setMapLoaded(true);
      existingScript.addEventListener('load', handleLoad);
      return () => existingScript.removeEventListener('load', handleLoad);
    }

    const script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU';
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const ymaps = window.ymaps;
    if (!mapLoaded || !ymaps || !cinemas || !mapContainerRef.current || mapRef.current) return;

    ymaps.ready(() => {
      const myMap = new ymaps.Map('map', {
        center: [52.0297, 113.5006],
        zoom: 6,
        controls: ['zoomControl', 'fullscreenControl'],
      });

      mapRef.current = myMap;

      const clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedRedClusterIcons',
      });

      const placemarks = cinemas.map((cinema) => {
        const placemark = new ymaps.Placemark(
          [cinema.latitude, cinema.longitude],
          {
            balloonContentHeader: cinema.name,
            balloonContentBody: `
              <div style="padding: 12px; color: #111111;">
                <p><strong>Адрес:</strong> ${cinema.address}</p>
                ${cinema.phone ? `<p><strong>Телефон:</strong> ${cinema.phone}</p>` : ''}
                ${cinema.description ? `<p>${cinema.description}</p>` : ''}
                ${cinema.link ? `<a href="${cinema.link}" target="_blank" style="color: #111111; display: inline-block; margin-top: 10px; font-weight: 700;">Перейти на сайт</a>` : ''}
              </div>
            `,
            balloonContentFooter: cinema.address,
          },
          {
            preset: 'islands#circleIcon',
            iconColor: '#111111',
          }
        );

        placemark.events.add('click', () => setSelectedCinema(cinema));
        return placemark;
      });

      clusterer.add(placemarks);
      myMap.geoObjects.add(clusterer);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, [mapLoaded, cinemas]);

  if (isLoading) {
    return <LoadingState label="Загрузка кинотеатров..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        eyebrow="Карта показов"
        title="Кинотеатры Забайкалья"
        description="Найдите ближайшую площадку, посмотрите контакты и перейдите на сайт кинотеатра для расписания и билетов."
        icon={<CinemaIcon />}
      />

      <section className="py-10 md:py-14 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_0.75fr] gap-5">
            <motion.div
              className="cinema-card overflow-hidden h-[520px] lg:h-[660px]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: easeOut }}
            >
              <div ref={mapContainerRef} id="map" className="w-full h-full" style={{ transition: 'none' }} />
            </motion.div>

            <motion.aside
              className="cinema-card overflow-hidden"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: easeOut, delay: 0.12 }}
            >
              <div className="p-5 border-b border-border">
                <h2 className="text-xl font-black text-foreground">Площадки</h2>
                <p className="mt-1 text-sm text-muted-foreground">Выберите кинотеатр, чтобы сфокусироваться на карте.</p>
              </div>
              <div className="max-h-[520px] lg:max-h-[660px] overflow-y-auto">
                {cinemas && cinemas.length > 0 ? (
                  cinemas.map((cinema, index) => (
                    <button
                      key={cinema.id}
                      onClick={() => setSelectedCinema(cinema)}
                      className={`w-full text-left p-5 border-b border-border last:border-b-0 hover:bg-secondary ${
                        selectedCinema?.id === cinema.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.48, delay: index * 0.04 }}
                      >
                        <h3 className="font-black text-foreground">{cinema.name}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{cinema.address}</p>
                        {cinema.phone && <p className="mt-2 text-sm text-muted-foreground">{cinema.phone}</p>}
                        {cinema.link && (
                          <a
                            href={cinema.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex text-sm font-bold text-primary hover:text-accent"
                            onClick={(event) => event.stopPropagation()}
                          >
                            Перейти на сайт
                          </a>
                        )}
                      </motion.div>
                    </button>
                  ))
                ) : (
                  <div className="p-5">
                    <EmptyState label="Кинотеатры пока не добавлены" />
                  </div>
                )}
              </div>
            </motion.aside>
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-[#f0f0ed]">
        <motion.div
          className="container mx-auto max-w-6xl"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.div variants={reveal} transition={{ duration: 0.65, ease: easeOut }} className="section-kicker mb-5">
            Для зрителей
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Билеты онлайн', description: 'Переходите на сайт выбранной площадки и покупайте билеты без лишних шагов.' },
              { title: 'Комфортные залы', description: 'Площадки региона подходят для премьер, семейных показов и специальных событий.' },
              { title: 'Доступная среда', description: 'Уточняйте условия посещения и поддержку маломобильных зрителей у кинотеатра.' },
            ].map((item) => (
              <motion.article key={item.title} variants={reveal} transition={{ duration: 0.65, ease: easeOut }} className="cinema-card p-6">
                <h3 className="text-lg font-black text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
