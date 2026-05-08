'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import useSWR from 'swr';

type SectionId = 'hero' | 'about' | 'footer';
type SocialPlatform = 'vk' | 'telegram' | 'youtube' | 'rutube' | 'ok' | 'dzen' | 'site';

interface FooterSocial {
  id: string;
  platform?: SocialPlatform;
  label: string;
  url: string;
  iconUrl?: string;
}

interface HomePageData {
  hero_title: string;
  hero_subtitle: string;
  about_title: string;
  about_content: string;
  footer_description: string;
  footer_address: string;
  footer_phone: string;
  footer_email: string;
  footer_socials: string;
}

type EditableFieldKey = Exclude<keyof HomePageData, 'footer_socials'>;

interface EditableField {
  key: EditableFieldKey;
  label: string;
  section: SectionId;
  type?: 'text' | 'textarea';
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const fields: EditableField[] = [
  { key: 'hero_title', label: 'Заголовок', section: 'hero' },
  { key: 'hero_subtitle', label: 'Подзаголовок', section: 'hero' },
  { key: 'about_title', label: 'Заголовок раздела', section: 'about', type: 'text' },
  { key: 'about_content', label: 'Основной текст', section: 'about', type: 'textarea' },
  { key: 'footer_description', label: 'Описание в подвале', section: 'footer', type: 'textarea' },
  { key: 'footer_address', label: 'Адрес', section: 'footer', type: 'textarea' },
  { key: 'footer_phone', label: 'Телефон', section: 'footer', type: 'text' },
  { key: 'footer_email', label: 'Email', section: 'footer', type: 'text' },
];

const sections: { id: SectionId; title: string; icon: string }[] = [
  { id: 'hero', title: 'Главный экран', icon: '01' },
  { id: 'about', title: 'О компании', icon: '02' },
  { id: 'footer', title: 'Подвал', icon: '03' },
];

const legacySocialLabels: Record<SocialPlatform, string> = {
  vk: 'ВКонтакте',
  telegram: 'Telegram',
  youtube: 'YouTube',
  rutube: 'Rutube',
  ok: 'Одноклассники',
  dzen: 'Дзен',
  site: 'Сайт',
};

export default function AdminHomePage() {
  const { status } = useSession();
  const router = useRouter();
  const [editingField, setEditingField] = useState<{ key: EditableFieldKey; value: string; label: string; type?: 'text' | 'textarea' } | null>(null);
  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>({
    hero: true,
    about: true,
    footer: true,
  });
  const [socialsDraft, setSocialsDraft] = useState<FooterSocial[]>([]);
  const [uploadingSocialId, setUploadingSocialId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: homeData, mutate } = useSWR<HomePageData>('/api/home', fetcher);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  useEffect(() => {
    if (homeData?.footer_socials !== undefined) {
      setSocialsDraft(parseFooterSocials(homeData.footer_socials));
    }
  }, [homeData?.footer_socials]);

  const fieldsBySection = useMemo(() => {
    return sections.reduce((acc, section) => {
      acc[section.id] = fields.filter((field) => field.section === section.id);
      return acc;
    }, {} as Record<SectionId, EditableField[]>);
  }, []);

  const saveHomeUpdates = async (updates: { key: string; value: string }[]) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при сохранении');
      }

      await mutate();
      setEditingField(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingField) return;
    await saveHomeUpdates([{ key: editingField.key, value: editingField.value }]);
  };

  const handleSaveSocials = async () => {
    const normalizedSocials = socialsDraft
      .map((social) => ({
        id: social.id,
        label: social.label.trim() || 'Соцсеть',
        url: social.url.trim(),
        iconUrl: social.iconUrl?.trim() || '',
      }))
      .filter((social) => social.url.length > 0);

    await saveHomeUpdates([{ key: 'footer_socials', value: JSON.stringify(normalizedSocials) }]);
  };

  const addSocial = () => {
    setSocialsDraft((prev) => [
      ...prev,
      {
        id: createSocialId(),
        label: 'Соцсеть',
        url: '',
        iconUrl: '',
      },
    ]);
  };

  const updateSocial = (id: string, update: Partial<FooterSocial>) => {
    setSocialsDraft((prev) =>
      prev.map((social) => (social.id === id ? { ...social, ...update } : social))
    );
  };

  const handleSocialIconUpload = async (id: string, file?: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Выберите файл изображения');
      return;
    }

    setUploadingSocialId(id);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'social-icons');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при загрузке иконки');
      }

      updateSocial(id, { iconUrl: data.fileUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке иконки');
    } finally {
      setUploadingSocialId(null);
    }
  };

  const removeSocial = (id: string) => {
    setSocialsDraft((prev) => prev.filter((social) => social.id !== id));
  };

  const toggleSection = (sectionId: SectionId) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-semibold">Назад</span>
            </Link>
            <h1 className="text-xl font-bold">Главная страница</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-secondary border border-border rounded-lg text-foreground">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-secondary border border-border rounded-lg text-foreground">
            Сохранено успешно!
          </div>
        )}

        <div className="space-y-6">
          {sections.map((section) => {
            const sectionFields = fieldsBySection[section.id];
            const isOpen = openSections[section.id];

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-lg border border-border overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-secondary text-primary flex items-center justify-center text-sm font-black">{section.icon}</span>
                    <span className="font-semibold text-foreground">{section.title}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border"
                    >
                      <div className="p-6 space-y-4">
                        {sectionFields.map((field) => {
                          const value = homeData?.[field.key] || '';
                          return (
                            <div key={field.key} className="bg-secondary/50 rounded-lg p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-medium text-primary mb-1">{field.label}</h3>
                                  <p className="text-foreground text-sm whitespace-pre-line line-clamp-2">{value || 'Не заполнено'}</p>
                                </div>
                                <button
                                  onClick={() => setEditingField({ key: field.key, value, label: field.label, type: field.type })}
                                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                  title="Редактировать"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {section.id === 'footer' && (
                          <div className="bg-secondary/50 rounded-lg p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                              <div>
                                <h3 className="text-sm font-medium text-primary mb-1">Социальные сети</h3>
                                <p className="text-sm text-muted-foreground">Загрузите картинку-иконку, добавьте подпись и вставьте ссылку. Пустые ссылки не будут показаны на сайте.</p>
                              </div>
                              <button
                                onClick={addSocial}
                                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
                                type="button"
                              >
                                Добавить соцсеть
                              </button>
                            </div>

                            <div className="space-y-3">
                              {socialsDraft.length === 0 && (
                                <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                                  Соцсети пока не добавлены.
                                </div>
                              )}

                              {socialsDraft.map((social) => (
                                <div key={social.id} className="grid gap-3 rounded-lg border border-border bg-card p-3 md:grid-cols-[220px_1fr_1.4fr_auto] md:items-center">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg border border-border bg-background flex items-center justify-center overflow-hidden text-xs font-black text-muted-foreground">
                                      {social.iconUrl ? (
                                        <img src={social.iconUrl} alt="" className="w-full h-full object-contain p-2" />
                                      ) : (
                                        'Нет'
                                      )}
                                    </div>
                                    <label className="px-3 py-2 rounded-lg bg-secondary hover:bg-muted text-sm font-medium transition-colors cursor-pointer">
                                      {uploadingSocialId === social.id ? 'Загрузка...' : 'Выбрать'}
                                      <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="sr-only"
                                        disabled={uploadingSocialId === social.id}
                                        onChange={(event) => {
                                          void handleSocialIconUpload(social.id, event.target.files?.[0]);
                                          event.currentTarget.value = '';
                                        }}
                                      />
                                    </label>
                                  </div>
                                  <input
                                    type="text"
                                    value={social.label}
                                    onChange={(event) => updateSocial(social.id, { label: event.target.value })}
                                    placeholder="Название"
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                  />
                                  <input
                                    type="url"
                                    value={social.url}
                                    onChange={(event) => updateSocial(social.id, { url: event.target.value })}
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                                  />
                                  <button
                                    onClick={() => removeSocial(social.id)}
                                    className="px-3 py-2 rounded-lg bg-secondary hover:bg-muted text-sm font-medium transition-colors"
                                    type="button"
                                  >
                                    Удалить
                                  </button>
                                </div>
                              ))}
                            </div>

                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={handleSaveSocials}
                                disabled={isLoading}
                                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                type="button"
                              >
                                {isLoading ? 'Сохранение...' : 'Сохранить соцсети'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {editingField && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setEditingField(null)}
          >
            <div
              className="bg-card rounded-lg border border-border max-w-lg w-full p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-4">Редактировать</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Поле</label>
                  <input
                    type="text"
                    value={editingField.label}
                    disabled
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-lg opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Значение</label>
                  {editingField.type === 'textarea' ? (
                    <textarea
                      value={editingField.value}
                      onChange={(event) => setEditingField({ ...editingField, value: event.target.value })}
                      className="w-full px-4 py-3 bg-secondary border border-border rounded-lg"
                      rows={6}
                      disabled={isLoading}
                    />
                  ) : (
                    <input
                      type="text"
                      value={editingField.value}
                      onChange={(event) => setEditingField({ ...editingField, value: event.target.value })}
                      className="w-full px-4 py-3 bg-secondary border border-border rounded-lg"
                      disabled={isLoading}
                    />
                  )}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Сохранение...' : 'Сохранить'}
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-secondary hover:bg-muted text-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function parseFooterSocials(value?: string): FooterSocial[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as FooterSocial[];
    if (!Array.isArray(parsed)) return [];

    return parsed.map((social, index) => ({
      id: social.id || String(index),
      platform: social.platform || 'site',
      label: social.label || getSocialLabel(social.platform),
      url: social.url || '',
      iconUrl: social.iconUrl || '',
    }));
  } catch {
    return [];
  }
}

function createSocialId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getSocialLabel(platform?: SocialPlatform) {
  if (!platform) return 'Соцсеть';
  return legacySocialLabels[platform] || 'Соцсеть';
}
