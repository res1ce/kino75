'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FooterProps {
  footerData?: {
    address: string;
    phone: string;
    email: string;
    description: string;
  };
}

const navLinks = [
  { href: '/', label: 'Главная' },
  { href: '/cinemas', label: 'Кинотеатры' },
  { href: '/news', label: 'Новости' },
  { href: '/services', label: 'Услуги' },
];

const infoLinks = [
  { href: '/anti-corruption', label: 'Противодействие коррупции' },
  { href: '/prosecutor', label: 'Прокурор разъясняет' },
  { href: '/admin', label: 'Вход в систему' },
];

export default function Footer({ footerData }: FooterProps) {
  const contacts = {
    address: footerData?.address || 'г. Чита, ул. Ленина, 1',
    phone: footerData?.phone || '+7 (3022) 00-00-00',
    email: footerData?.email || 'info@kino75.ru',
    description: footerData?.description || 'Искусство кино в сердце Забайкалья',
  };

  return (
    <footer className="relative overflow-hidden bg-white text-foreground border-t border-border">
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-fuchsia-400" />
      <div className="absolute inset-0 opacity-15 film-strip" />
      <div className="container mx-auto px-4 md:px-6 py-14 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-9 md:gap-12">
          <motion.div
            className="md:col-span-4"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <Link href="/" className="flex items-center gap-3 w-fit">
              <div className="w-12 h-12 rounded-lg bg-primary text-white flex items-center justify-center font-black">
                75
              </div>
              <div>
                <div className="font-black text-foreground">Забайкальская</div>
                <div className="text-sm text-muted-foreground uppercase">государственная кинокомпания</div>
              </div>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {contacts.description}. Развиваем кинопроизводство, показы и культурные проекты в Забайкальском крае.
            </p>
            <div className="mt-7 flex gap-3">
              {['VK', 'TG', 'YT'].map((social) => (
                <a
                  key={social}
                  href="#"
                  title={social}
                  className="w-10 h-10 rounded-lg border border-border bg-secondary text-muted-foreground hover:text-primary hover:border-primary flex items-center justify-center text-sm font-black"
                >
                  {social}
                </a>
              ))}
            </div>
          </motion.div>

          <FooterColumn title="Навигация" links={navLinks} delay={0.08} />
          <FooterColumn title="Информация" links={infoLinks} delay={0.16} />

          <motion.div
            className="md:col-span-4"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.24 }}
          >
            <h3 className="text-sm font-black text-primary uppercase mb-5">Контакты</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <IconBox>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </IconBox>
                <span>{contacts.address}</span>
              </li>
              <li className="flex gap-3">
                <IconBox>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.04 11.04 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 18.72V20a2 2 0 01-2 2h-1C9.716 22 2 14.284 2 5V5z" />
                </IconBox>
                <a href={`tel:${contacts.phone}`} className="hover:text-primary">{contacts.phone}</a>
              </li>
              <li className="flex gap-3">
                <IconBox>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l8.2 5.466a1.5 1.5 0 001.6 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </IconBox>
                <a href={`mailto:${contacts.email}`} className="hover:text-primary">{contacts.email}</a>
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Забайкальская государственная кинокомпания. Все права защищены.</p>
          <div className="flex flex-wrap gap-5">
            <Link href="#" className="hover:text-primary">Политика конфиденциальности</Link>
            <Link href="#" className="hover:text-primary">Условия использования</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  delay,
}: {
  title: string;
  links: { href: string; label: string }[];
  delay: number;
}) {
  return (
    <motion.div
      className="md:col-span-2"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay }}
    >
      <h3 className="text-sm font-black text-primary uppercase mb-5">{title}</h3>
      <ul className="space-y-3">
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function IconBox({ children }: { children: ReactNode }) {
  return (
    <span className="w-9 h-9 rounded-lg border border-border bg-secondary text-primary flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {children}
      </svg>
    </span>
  );
}
