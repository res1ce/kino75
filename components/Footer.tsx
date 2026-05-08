'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import useSWR from 'swr';

type SocialPlatform = 'vk' | 'telegram' | 'youtube' | 'rutube' | 'ok' | 'dzen' | 'site';

interface FooterSocial {
  id: string;
  platform?: SocialPlatform;
  label: string;
  url: string;
  iconUrl?: string;
}

interface FooterProps {
  footerData?: {
    address: string;
    phone: string;
    email: string;
    description: string;
    socials?: FooterSocial[];
  };
}

interface HomeFooterData {
  footer_address?: string;
  footer_phone?: string;
  footer_email?: string;
  footer_description?: string;
  footer_socials?: string;
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

const defaultFooter = {
  address: 'г. Чита, ул. Ленина, 1',
  phone: '+7 (3022) 00-00-00',
  email: 'info@kino75.ru',
  description: 'Искусство кино в сердце Забайкалья',
  socials: [] as FooterSocial[],
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Footer({ footerData }: FooterProps) {
  const { data: homeData } = useSWR<HomeFooterData>('/api/home', fetcher);

  const contacts = {
    address: footerData?.address || homeData?.footer_address || defaultFooter.address,
    phone: footerData?.phone || homeData?.footer_phone || defaultFooter.phone,
    email: footerData?.email || homeData?.footer_email || defaultFooter.email,
    description: footerData?.description || homeData?.footer_description || defaultFooter.description,
  };
  const socials = footerData?.socials || parseFooterSocials(homeData?.footer_socials);

  return (
    <footer className="relative overflow-hidden bg-[#111111] text-white border-t border-white/10">
      <div className="h-1 bg-gradient-to-r from-white/20 via-white/75 to-white/20" />
      <div className="absolute inset-0 opacity-10 film-strip" />
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
              <div className="w-12 h-12 rounded-lg bg-white text-[#111111] flex items-center justify-center font-black">
                75
              </div>
              <div>
                <div className="font-black text-white">Забайкальская</div>
                <div className="text-sm text-white/60 uppercase">государственная кинокомпания</div>
              </div>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/70">
              {contacts.description}
            </p>
            {socials.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-3">
                {socials.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    title={social.label}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-lg border border-white/10 bg-white/10 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/20 flex items-center justify-center text-sm font-black transition-colors"
                  >
                    {social.iconUrl ? (
                      <img src={social.iconUrl} alt="" className="w-5 h-5 object-contain" />
                    ) : (
                      <SocialIcon platform={social.platform} label={social.label} />
                    )}
                  </a>
                ))}
              </div>
            )}
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
            <h3 className="text-sm font-black text-white uppercase mb-5">Контакты</h3>
            <ul className="space-y-4 text-sm text-white/70">
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
                <a href={`tel:${contacts.phone}`} className="hover:text-white transition-colors">{contacts.phone}</a>
              </li>
              <li className="flex gap-3">
                <IconBox>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l8.2 5.466a1.5 1.5 0 001.6 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </IconBox>
                <a href={`mailto:${contacts.email}`} className="hover:text-white transition-colors">{contacts.email}</a>
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-xs text-white/50">
          <p>&copy; {new Date().getFullYear()} Забайкальская государственная кинокомпания. Все права защищены.</p>
          <div className="flex flex-wrap gap-5">
            <Link href="#" className="hover:text-white transition-colors">Политика конфиденциальности</Link>
            <Link href="#" className="hover:text-white transition-colors">Условия использования</Link>
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
      <h3 className="text-sm font-black text-white uppercase mb-5">{title}</h3>
      <ul className="space-y-3">
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-sm text-white/60 hover:text-white transition-colors">
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
    <span className="w-9 h-9 rounded-lg border border-white/10 bg-white/10 text-white flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {children}
      </svg>
    </span>
  );
}

function SocialIcon({ platform = 'site', label }: { platform?: SocialPlatform; label: string }) {
  if (platform === 'telegram') {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-label={label}>
        <path d="M20.9 4.3 3.9 10.9c-1.1.4-1.1 1.1-.2 1.4l4.4 1.4 1.7 5.3c.2.6.4.8.8.8s.6-.2.9-.5l2.1-2 4.3 3.2c.8.4 1.3.2 1.5-.7l2.7-12.9c.3-1.1-.4-1.6-1.2-1.2Zm-3.8 3-7.1 6.4-.3 3.3-1.3-4.4 8.1-5.2c.4-.3.8-.1.6-.1Z" />
      </svg>
    );
  }

  if (platform === 'youtube') {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-label={label}>
        <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 4.9 12 4.9 12 4.9s-6 0-7.7.4a2.7 2.7 0 0 0-1.9 1.9A28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9c1.7.4 7.7.4 7.7.4s6 0 7.7-.4a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
      </svg>
    );
  }

  if (platform === 'site') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label={label}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 100 20 10 10 0 000-20Zm0 0c2.5 2.7 3.7 6 3.7 10S14.5 19.3 12 22m0-20C9.5 4.7 8.3 8 8.3 12S9.5 19.3 12 22M2 12h20" />
      </svg>
    );
  }

  const shortLabels: Record<SocialPlatform, string> = {
    vk: 'VK',
    telegram: 'TG',
    youtube: 'YT',
    rutube: 'R',
    ok: 'OK',
    dzen: 'D',
    site: 'WWW',
  };

  return <span aria-label={label}>{shortLabels[platform] || label.slice(0, 2).toUpperCase()}</span>;
}

function parseFooterSocials(value?: string): FooterSocial[] {
  if (!value) return defaultFooter.socials;

  try {
    const parsed = JSON.parse(value) as FooterSocial[];
    if (!Array.isArray(parsed)) return defaultFooter.socials;

    return parsed
      .filter((social) => social && social.url)
      .map((social, index) => ({
        id: social.id || String(index),
        platform: social.platform || 'site',
        label: social.label || 'Соцсеть',
        url: social.url,
        iconUrl: social.iconUrl || '',
      }));
  } catch {
    return defaultFooter.socials;
  }
}
