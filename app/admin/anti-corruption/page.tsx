'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import useSWR from 'swr';

interface Document {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileName: string;
  fileSize?: number | null;
  category?: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

const emptyFormData = {
  title: '',
  description: '',
  category: '',
  fileUrl: '',
  fileName: '',
  fileSize: null as number | null,
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatFileSize(bytes?: number | null) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export default function AdminAntiCorruptionPage() {
  const { status } = useSession();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: docsResponse, mutate } = useSWR<{ data: Document[] }>('/api/anti-corruption?limit=1000', fetcher);
  const documents = docsResponse?.data || [];

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  const resetForm = () => {
    setEditingDoc(null);
    setFormData(emptyFormData);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = editingDoc ? `/api/anti-corruption/${editingDoc.id}` : '/api/anti-corruption';
      const method = editingDoc ? 'PUT' : 'POST';

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
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: Document) => {
    setEditingDoc(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      category: item.category || '',
      fileUrl: item.fileUrl,
      fileName: item.fileName,
      fileSize: item.fileSize || null,
    });
    setError(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот документ?')) return;

    try {
      const response = await fetch(`/api/anti-corruption/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Ошибка при удалении');
      await mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка при удалении');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('folder', 'anti-corruption');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Ошибка при загрузке файла');
      }

      setFormData((prev) => ({
        ...prev,
        fileName: result.fileName,
        fileUrl: result.fileUrl,
        fileSize: result.fileSize,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке файла');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
            <h1 className="text-xl font-bold">Противодействие коррупции</h1>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
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
          <motion.div className="space-y-4">
            {documents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Документов пока нет. Добавьте первый.
              </div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="bg-card rounded-lg border border-border p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{doc.title}</h3>
                      {doc.category && <p className="text-sm text-muted-foreground">{doc.category}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{doc.fileName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(doc.publishedAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(doc)} className="p-2 hover:bg-secondary rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
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
          <motion.form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
            <div className="bg-card rounded-lg border border-border p-6 space-y-4">
              <h2 className="text-xl font-semibold">
                {editingDoc ? 'Редактирование документа' : 'Добавить документ'}
              </h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Название</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Категория</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Федеральные законы"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Файл</label>
                <button
                  type="button"
                  className="w-full border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors disabled:opacity-50"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isUploading}
                >
                  <svg className="w-12 h-12 mx-auto text-muted-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm text-muted-foreground">
                    {isUploading
                      ? 'Загрузка файла...'
                      : formData.fileName
                        ? `${formData.fileName}${formData.fileSize ? `, ${formatFileSize(formData.fileSize)}` : ''}`
                        : 'Нажмите, чтобы загрузить файл'}
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoading || isUploading}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={isLoading || isUploading}
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
