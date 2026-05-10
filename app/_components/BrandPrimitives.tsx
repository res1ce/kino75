'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const easeOut = [0.16, 1, 0.3, 1] as const;

export const reveal = {
  initial: { opacity: 0, y: 28, clipPath: 'inset(18% 0 0 0)' },
  animate: { opacity: 1, y: 0, clipPath: 'inset(0 0 0 0)' },
};

export const stagger = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="brand-spinner mx-auto mb-4" />
        <p className="text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="cinema-card py-14 px-6 text-center text-muted-foreground">
      {label}
    </div>
  );
}

export function IconTile({ children }: { children: ReactNode }) {
  return (
    <div className="w-16 h-16 rounded-lg border border-border bg-white text-primary flex items-center justify-center shadow-[0_14px_34px_rgba(17,17,17,0.1)]">
      {children}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="brand-hero film-grain py-16 md:py-20 px-4">
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          className="max-w-4xl"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.div variants={reveal} transition={{ duration: 0.65, ease: easeOut }} className="section-kicker mb-6">
            {eyebrow}
          </motion.div>
          <motion.div variants={reveal} transition={{ duration: 0.65, ease: easeOut }} className="mb-7">
            <IconTile>{icon}</IconTile>
          </motion.div>
          <motion.h1
            variants={reveal}
            transition={{ duration: 0.72, ease: easeOut }}
            className="text-4xl md:text-6xl font-black leading-[1.04] text-foreground max-w-4xl"
          >
            {title}
          </motion.h1>
          <motion.p
            variants={reveal}
            transition={{ duration: 0.72, ease: easeOut }}
            className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed"
          >
            {description}
          </motion.p>
          {children && (
            <motion.div variants={reveal} transition={{ duration: 0.72, ease: easeOut }} className="mt-8">
              {children}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-bold border ${
        active
          ? 'bg-primary text-primary-foreground border-primary shadow-[0_12px_26px_rgba(17,17,17,0.28)]'
          : 'bg-secondary text-foreground border-border hover:border-accent hover:text-accent'
      }`}
    >
      {children}
    </button>
  );
}

export function TextLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 text-primary font-bold hover:text-accent">
      {children}
      <ArrowIcon className="w-4 h-4" />
    </Link>
  );
}

export function ArrowIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

export function CinemaIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2m14 0V8a2 2 0 00-2-2h-1M5 11V8a2 2 0 012-2h1m0 0V4h8v2M8 6h8" />
    </svg>
  );
}

export function NewsIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5.5A2.5 2.5 0 016.5 3h9A2.5 2.5 0 0118 5.5V21l-7-3-7 3V5.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h6M8 11h6M8 15h3" />
    </svg>
  );
}

export function ServiceIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7a2 2 0 012-2h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 5V3h8v2M4 11h16M12 11v3" />
    </svg>
  );
}

export function PeopleIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 19v-1.5a4 4 0 00-4-4H8a4 4 0 00-4 4V19" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 10a3 3 0 100-6 3 3 0 000 6z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 19v-1a3.5 3.5 0 00-2.5-3.35M16 4.35a3 3 0 010 5.8" />
    </svg>
  );
}

export function ShieldIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3l7 3v5c0 4.6-2.8 8.6-7 10-4.2-1.4-7-5.4-7-10V6l7-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-5" />
    </svg>
  );
}

export function ScaleIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16M7 20h10M5 7l7-2 7 2M6 7l-3 7h6L6 7zm12 0l-3 7h6l-3-7z" />
    </svg>
  );
}

export function SearchIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.1-5.4a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
    </svg>
  );
}

export function DownloadIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v10m0 0l-4-4m4 4l4-4M5 20h14" />
    </svg>
  );
}
