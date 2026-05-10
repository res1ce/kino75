'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import useSWR from 'swr';
import {
  EmptyState,
  PageHero,
  PeopleIcon,
  easeOut,
  reveal,
  stagger,
} from '../_components/BrandPrimitives';

interface AboutData {
  about_title: string;
  about_content: string;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  photoUrl?: string | null;
}

const defaultAbout: AboutData = {
  about_title: 'О компании',
  about_content:
    'Забайкальская государственная кинокомпания — ведущий производитель кинопродукции в регионе, работающий с 1975 года. Мы создаём фильмы, которые вдохновляют, информируют и объединяют людей.\n\nНаша миссия — развитие кинокультуры в Забайкальском крае, поддержка местных талантов и создание качественного контента для зрителей всех возрастов.',
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AboutPage() {
  const { data: aboutData } = useSWR<AboutData>('/api/home', fetcher, {
    fallbackData: defaultAbout,
    revalidateOnFocus: false,
  });
  const { data: employees, isLoading } = useSWR<Employee[]>('/api/employees?active=true', fetcher);

  const data = aboutData || defaultAbout;
  const paragraphs = data.about_content
    .split('\n\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        eyebrow="О нас"
        title={data.about_title}
        description="Информация о кинокомпании и команде, которая работает над проектами, показами и развитием кино в Забайкалье."
        icon={<PeopleIcon />}
      />

      <section className="px-4 py-16 md:py-20 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="max-w-4xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.25 }}
            variants={stagger}
          >
            <motion.div variants={reveal} transition={{ duration: 0.65, ease: easeOut }} className="section-kicker mb-5">
              О компании
            </motion.div>
            <motion.div variants={reveal} transition={{ duration: 0.7, ease: easeOut }} className="space-y-5">
              {paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-base md:text-lg leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-16 md:py-20 bg-[#f0f0ed]">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            className="mb-10 md:mb-12 max-w-3xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.25 }}
            variants={stagger}
          >
            <motion.div variants={reveal} transition={{ duration: 0.65, ease: easeOut }} className="section-kicker mb-5">
              Команда
            </motion.div>
            <motion.h2 variants={reveal} transition={{ duration: 0.7, ease: easeOut }} className="text-3xl md:text-5xl font-black leading-tight">
              Сотрудники кинокомпании
            </motion.h2>
          </motion.div>

          {isLoading ? (
            <div className="cinema-card py-14 px-6 text-center text-muted-foreground">
              Загрузка сотрудников...
            </div>
          ) : employees && employees.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.12 }}
              variants={stagger}
            >
              {employees.map((employee) => (
                <motion.article
                  key={employee.id}
                  variants={reveal}
                  transition={{ duration: 0.62, ease: easeOut }}
                  whileHover={{ y: -6 }}
                  className="cinema-card overflow-hidden bg-white"
                >
                  <div className="aspect-[4/5] bg-secondary overflow-hidden relative">
                    {employee.photoUrl ? (
                      <Image
                        src={employee.photoUrl}
                        alt={employee.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl font-black text-primary/35">
                        {getInitials(employee.name)}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-black text-foreground">{employee.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{employee.position}</p>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          ) : (
            <EmptyState label="Сотрудники пока не добавлены" />
          )}
        </div>
      </section>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
