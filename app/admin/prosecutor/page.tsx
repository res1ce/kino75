'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import useSWR from 'swr';

interface Explanation {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminProsecutorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingExplanation, setEditingExplanation] = useState<Explanation | null>(null);
  const [formData, setFormData] = useState({ title: '', slug: '', excerpt: '', content: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: explanationsResponse, mutate } = useSWR<{ data: Explanation[] }>('/api/prosecutor?limit=1000', fetcher);
  const explanations = explanationsResponse?.data || [];

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Placeholder.configure({ placeholder: 'Введите текст разъяснения...' }),
    ],
    content: formData.content,
    onUpdate: ({ editor }) => setFormData(prev => ({ ...prev, content: editor.getHTML() })),
  });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  useEffect(() => {
    if (editor && formData.content) {
      editor.commands.setContent(formData.content);
    }
  }, [showForm, editor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = editingExplanation ? `/api/prosecutor/${editingExplanation.slug}` : '/api/prosecutor';
      const method = editingExplanation ? 'PUT' : 'POST';

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
      setEditingExplanation(null);
      setFormData({ title: '', slug: '', excerpt: '', content: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: Explanation) => {
    setEditingExplanation(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || '',
      content: item.content,
    });
    setShowForm(true);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Вы уверены, что хотите удалить это разъяснение?')) return;

    try {
      const response = await fetch(`/api/prosecutor/${slug}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Ошибка при удалении');
      await mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка при удалении');
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
            <h1 className="text-xl font-bold">Прокурор разъясняет</h1>
            <button
              onClick={() => { setShowForm(true); setEditingExplanation(null); setFormData({ title: '', slug: '', excerpt: '', content: '' }); }}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium"
            >
              + Добавить
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
            {explanations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Разъяснений пока нет. Добавьте первое!
              </div>
            ) : (
              explanations.map((exp) => (
                <div key={exp.id} className="bg-card rounded-lg border border-border p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{exp.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(exp.publishedAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(exp)}
                        className="p-2 hover:bg-secondary rounded-lg"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(exp.slug)}
                        className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="max-w-3xl space-y-6"
          >
            <div className="bg-card rounded-lg border border-border p-6 space-y-4">
              <h2 className="text-xl font-semibold">
                {editingExplanation ? 'Редактирование разъяснения' : 'Добавить разъяснение'}
              </h2>

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
                    — это часть URL адреса страницы. Например:{' '}
                    <code className="bg-secondary px-2 py-1 rounded">
                      /prosecutor/{formData.slug || 'zagolovok'}
                    </code>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="zagolovok-raz-yasneniya"
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
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                      className="p-2 hover:bg-secondary rounded min-w-[32px]"
                      title="Заголовок H2"
                      disabled={isLoading}
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      className="p-2 hover:bg-secondary rounded min-w-[32px]"
                      title="Маркированный список"
                      disabled={isLoading}
                    >
                      • Список
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                      className="p-2 hover:bg-secondary rounded min-w-[32px]"
                      title="Нумерованный список"
                      disabled={isLoading}
                    >
                      1. Список
                    </button>
                  </div>
                  <EditorContent
                    editor={editor}
                    className="prose prose-lg dark:prose-invert p-4 min-h-[300px] max-w-none"
                  />
                </div>
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
          </motion.form>
        )}
      </main>
    </div>
  );
}
