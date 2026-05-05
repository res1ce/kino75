'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import useSWR from 'swr';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  imageUrl?: string | null;
  published: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface NewsResponse {
  data: NewsItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const toDateInputValue = (value?: string | null) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const createEmptyFormData = () => ({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  imageUrl: '',
  published: false,
  publishedAt: toDateInputValue(),
});

export default function AdminNewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState(createEmptyFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const coverInputRef = useRef<HTMLInputElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);

  const { data: newsResponse, mutate } = useSWR<NewsResponse>('/api/news', fetcher);
  const news = newsResponse?.data || [];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: { class: 'news-editor-image' },
      }),
      LinkExtension.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' }),
      Placeholder.configure({ placeholder: 'Введите текст новости...' }),
    ],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, content: editor.getHTML() }));
    },
  });

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(formData.content || '<p></p>');
    }
  }, [showForm, editor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = editingNews ? `/api/news/${editingNews.slug}` : '/api/news';
      const method = editingNews ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при сохранении');
      }

      await mutate();
      setShowForm(false);
      setEditingNews(null);
      setFormData(createEmptyFormData());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: NewsItem) => {
    setEditingNews(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || '',
      content: item.content,
      imageUrl: item.imageUrl || '',
      published: item.published,
      publishedAt: toDateInputValue(item.publishedAt || item.createdAt),
    });
    setActiveTab('edit');
    setShowForm(true);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту новость?')) return;

    try {
      const response = await fetch(`/api/news/${slug}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Ошибка при удалении');
      await mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка при удалении');
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Выберите файл изображения для обложки');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        setFormData((prev) => ({ ...prev, imageUrl: src }));
      };
      reader.readAsDataURL(file);
    }
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  };

  const handleContentImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      if (!file.type.startsWith('image/')) {
        setError('Выберите файл изображения для текста новости');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        editor
          .chain()
          .focus()
          .insertContent([
            { type: 'image', attrs: { src, alt: file.name, title: file.name } },
            { type: 'paragraph' },
          ])
          .run();
      };
      reader.readAsDataURL(file);
    }
    if (contentImageInputRef.current) {
      contentImageInputRef.current.value = '';
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^а-яёa-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-muted-foreground">Загрузка...</div></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-semibold text-foreground">Назад</span>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Управление новостями</h1>
            <button
              onClick={() => { setShowForm(true); setEditingNews(null); setFormData(createEmptyFormData()); setActiveTab('edit'); }}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
            >
              + Добавить новость
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-secondary border border-border rounded-lg text-foreground">
            {error}
          </div>
        )}

        {!showForm ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Заголовок раздела с поиском */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Все новости</h2>
              <span className="text-sm text-muted-foreground">
                Всего: {news.length}
              </span>
            </div>

            {news.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg mb-2">Новостей пока нет</p>
                <p className="text-sm">Создайте первую новость, нажав кнопку «Добавить новость»</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {news.map((item) => (
                  <div key={item.id} className="bg-card rounded-lg border border-border p-6 hover:border-primary/50 transition-all group">
                    <div className="flex items-start justify-between gap-4">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="hidden sm:block w-28 h-20 rounded-lg border border-border object-cover bg-secondary shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.published ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                          }`}>
                            {item.published ? '✓ Опубликовано' : '⏳ Черновик'}
                          </span>
                          {item.publishedAt && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(item.publishedAt).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.excerpt || 'Без описания'}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <code className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                            /news/{item.slug}
                          </code>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors text-primary"
                          title="Редактировать"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.slug)}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          title="Удалить"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Вкладки переключения */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'edit'
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-card text-foreground border border-border hover:bg-secondary'
                }`}
              >
                ✏️ Редактирование
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'preview'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-card text-foreground border border-border hover:bg-secondary'
                }`}
              >
                👁️ Предпросмотр
              </button>
            </div>

            {activeTab === 'edit' ? (
              <motion.form
                key="edit-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="bg-card rounded-lg border border-border p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    {editingNews ? 'Редактирование новости' : 'Новая новость'}
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Заголовок</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          setFormData({ ...formData, title });
                          if (!formData.slug || formData.slug === generateSlug(formData.title)) {
                            setFormData(prev => ({ ...prev, slug: generateSlug(title) }));
                          }
                        }}
                        className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Slug (URL)
                        <span className="text-muted-foreground font-normal ml-2">
                          — это часть URL адреса страницы. Например: <code className="bg-secondary px-2 py-1 rounded">/news/{formData.slug || 'zagolovok-novosti'}</code>
                        </span>
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="zagolovok-novosti"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        💡 Slug генерируется автоматически из заголовка, но вы можете изменить его вручную
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Краткое описание</label>
                      <textarea
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={2}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Дата публикации</label>
                        <input
                          type="date"
                          value={formData.publishedAt}
                          onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Обложка новости</label>
                        <div className="rounded-lg border border-border bg-secondary p-4">
                          {formData.imageUrl ? (
                            <div className="flex flex-col sm:flex-row gap-4">
                              <img
                                src={formData.imageUrl}
                                alt="Обложка новости"
                                className="w-full sm:w-48 aspect-video rounded-lg border border-border object-cover bg-background"
                              />
                              <div className="flex flex-col justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => coverInputRef.current?.click()}
                                  className="px-4 py-2 rounded-lg bg-card border border-border text-sm font-medium hover:bg-muted"
                                  disabled={isLoading}
                                >
                                  Заменить обложку
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                                  className="px-4 py-2 rounded-lg bg-card border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                                  disabled={isLoading}
                                >
                                  Убрать обложку
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => coverInputRef.current?.click()}
                              className="w-full min-h-28 rounded-lg border-2 border-dashed border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary"
                              disabled={isLoading}
                            >
                              Выбрать картинку для обложки
                            </button>
                          )}
                          <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCoverUpload}
                            className="hidden"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Контент</label>
                      <div className="border border-border rounded-lg overflow-hidden">
                        <div className="border-b border-border p-2 bg-secondary flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => editor?.chain().focus().toggleBold().run()}
                            className="p-2 hover:bg-secondary rounded min-w-[32px]"
                            title="Жирный"
                            disabled={isLoading}
                          >
                            <span className="font-bold">B</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => editor?.chain().focus().toggleItalic().run()}
                            className="p-2 hover:bg-secondary rounded min-w-[32px]"
                            title="Курсив"
                            disabled={isLoading}
                          >
                            <span className="italic">I</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => undefined}
                            className="hidden"
                            title="Заголовок H2"
                            disabled={isLoading}
                          >
                            H2
                          </button>
                          <button
                            type="button"
                            onClick={() => undefined}
                            className="hidden"
                            title="Маркированный список"
                            disabled={isLoading}
                          >
                            • Список
                          </button>
                          <button
                            type="button"
                            onClick={() => undefined}
                            className="hidden"
                            title="Нумерованный список"
                            disabled={isLoading}
                          >
                            1. Список
                          </button>
                          <button
                            type="button"
                            onClick={() => contentImageInputRef.current?.click()}
                            className="px-3 py-2 hover:bg-card rounded text-sm font-medium"
                            title="Вставить картинку в текст"
                            disabled={isLoading}
                          >
                            Картинка в текст
                          </button>
                          <input
                            ref={contentImageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleContentImageUpload}
                            className="hidden"
                            disabled={isLoading}
                          />
                        </div>
                        <EditorContent
                          editor={editor}
                          className="admin-news-editor prose prose-lg dark:prose-invert p-4 min-h-[360px] max-w-none"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        💡 Ссылки в тексте распознаются автоматически при вставке
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="published"
                        checked={formData.published}
                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                        className="w-4 h-4 text-primary rounded"
                        disabled={isLoading}
                      />
                      <label htmlFor="published" className="text-sm text-foreground">Опубликовано</label>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Сохранение...' : 'Сохранить'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        disabled={isLoading}
                  className="px-6 py-3 bg-secondary hover:bg-muted text-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="preview-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-lg border border-border p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Предпросмотр новости</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    formData.published ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {formData.published ? 'Опубликовано' : 'Черновик'}
                  </span>
                </div>

                {/* Предпросмотр Hero Section */}
                <div className="bg-gradient-to-r from-ink-900 via-ink-800 to-ink-900 rounded-lg p-6 mb-6">
                  <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                    {formData.title || 'Заголовок новости'}
                  </h1>
                  <p className="text-white/75">
                    {new Date(formData.publishedAt || Date.now()).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt={formData.title || 'Обложка новости'}
                    className="w-full aspect-video object-cover rounded-lg border border-border mb-6 bg-secondary"
                  />
                )}

                {/* Предпросмотр описания */}
                {formData.excerpt && (
                  <div className="mb-6 p-4 bg-secondary rounded-lg border border-border">
                    <p className="text-foreground italic">{formData.excerpt}</p>
                  </div>
                )}

                {/* Предпросмотр контента */}
                <div
                  className="prose prose-lg dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.content || '<p class="text-muted-foreground">Контент новости...</p>' }}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
