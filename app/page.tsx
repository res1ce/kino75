'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import useSWR from 'swr';
import {
  CinemaIcon,
  NewsIcon,
  PeopleIcon,
  ScaleIcon,
  ServiceIcon,
  ShieldIcon,
  TextLink,
  easeOut,
  reveal,
  stagger,
} from './_components/BrandPrimitives';

interface HomePageData {
  hero_title: string;
  hero_subtitle: string;
}

const defaultData: HomePageData = {
  hero_title: 'Забайкальская государственная кинокомпания',
  hero_subtitle: 'Региональное кино, кинопоказы и культурные проекты Забайкалья',
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const pillars = [
  {
    icon: <PeopleIcon className="w-7 h-7" />,
    number: '01',
    title: 'О нас',
    description: 'Информация о кинокомпании и сотрудниках.',
    href: '/about',
  },
  {
    icon: <CinemaIcon className="w-7 h-7" />,
    number: '02',
    title: 'Кинотеатры',
    description: 'Список кинотеатров и ссылки на их сайты.',
    href: '/cinemas',
  },
  {
    icon: <NewsIcon className="w-7 h-7" />,
    number: '03',
    title: 'Новости',
    description: 'Публикации, объявления и события компании.',
    href: '/news',
  },
  {
    icon: <ServiceIcon className="w-7 h-7" />,
    number: '04',
    title: 'Услуги',
    description: 'Перечень услуг, описание и стоимость.',
    href: '/services',
  },
  {
    icon: <ShieldIcon className="w-7 h-7" />,
    number: '05',
    title: 'Противодействие коррупции',
    description: 'Нормативные документы и материалы.',
    href: '/anti-corruption',
  },
  {
    icon: <ScaleIcon className="w-7 h-7" />,
    number: '06',
    title: 'Прокурор разъясняет',
    description: 'Правовые разъяснения для посетителей сайта.',
    href: '/prosecutor',
  },
];

export default function HomePage() {
  const { data: homeData } = useSWR<HomePageData>('/api/home', fetcher, {
    fallbackData: defaultData,
    revalidateOnFocus: false,
  });

  const data = homeData || defaultData;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative min-h-[82svh] flex items-center overflow-hidden px-4 py-20 md:py-28 film-grain">
        <div
          className="absolute inset-0 bg-cover bg-center animate-subtle-pan"
          style={{ backgroundImage: "url('/hero-transbaikalia-cinema.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,250,247,0.96)_0%,rgba(250,250,247,0.82)_48%,rgba(250,250,247,0.52)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute left-0 top-0 h-full w-14 hidden lg:block border-r border-black/10 film-strip opacity-25" />

        <motion.div
          className="container mx-auto max-w-7xl relative z-10"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <div className="max-w-4xl">
            <motion.div variants={reveal} transition={{ duration: 0.7, ease: easeOut }} className="section-kicker mb-7">
              С 1975 года
            </motion.div>
            <motion.h1
              variants={reveal}
              transition={{ duration: 0.82, ease: easeOut }}
              className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.02] max-w-5xl"
            >
              {data.hero_title}
            </motion.h1>
            <motion.p
              variants={reveal}
              transition={{ duration: 0.82, ease: easeOut }}
              className="mt-7 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed"
            >
              {data.hero_subtitle}
            </motion.p>
            <motion.div
              variants={reveal}
              transition={{ duration: 0.82, ease: easeOut }}
              className="mt-10 flex flex-col sm:flex-row gap-3"
            >
              <Link href="/cinemas" className="btn-primary px-7 py-3">
                Наши кинотеатры
                <CinemaIcon className="w-5 h-5" />
              </Link>
              <Link href="/news" className="btn-secondary px-7 py-3">
                Наши новости
                <NewsIcon className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section className="py-20 md:py-28 px-4 bg-[#f0f0ed]">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            className="mb-12 md:mb-16 max-w-5xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.25 }}
            variants={stagger}
          >
            <div>
              <motion.div variants={reveal} transition={{ duration: 0.65, ease: easeOut }} className="section-kicker mb-5">
                Направления
              </motion.div>
              <motion.h2 variants={reveal} transition={{ duration: 0.7, ease: easeOut }} className="text-3xl md:text-5xl font-black leading-tight">
                Разделы сайта
              </motion.h2>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.12 }}
            variants={stagger}
          >
            {pillars.map((item) => (
              <motion.article
                key={item.number}
                variants={reveal}
                transition={{ duration: 0.62, ease: easeOut }}
                whileHover={{ y: -6 }}
                className="cinema-card group relative overflow-hidden p-6"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-fuchsia-400 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300" />
                <div className="flex items-start justify-between gap-6">
                  <div className="w-14 h-14 rounded-lg bg-secondary border border-border flex items-center justify-center text-primary group-hover:text-accent">
                    {item.icon}
                  </div>
                  <span className="text-5xl font-black text-black/10">{item.number}</span>
                </div>
                <h3 className="mt-8 text-xl font-black text-foreground group-hover:text-primary">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                <div className="mt-7">
                  <TextLink href={item.href}>Подробнее</TextLink>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

    </div>
  );
}
