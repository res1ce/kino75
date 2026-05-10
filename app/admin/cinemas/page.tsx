'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import useSWR from 'swr';

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
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminCinemasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingCinema, setEditingCinema] = useState<Cinema | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: 52.0297,
    longitude: 113.5006,
    link: '',
    phone: '',
    description: '',
    active: true,
    order: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: cinemas, mutate } = useSWR<Cinema[]>('/api/cinemas', fetcher);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = editingCinema ? `/api/cinemas/${editingCinema.id}` : '/api/cinemas';
      const method = editingCinema ? 'PUT' : 'POST';

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
      setEditingCinema(null);
      setFormData({ name: '', address: '', latitude: 52.0297, longitude: 113.5006, link: '', phone: '', description: '', active: true, order: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: Cinema) => {
    setEditingCinema(item);
    setFormData({
      name: item.name,
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
      link: item.link || '',
      phone: item.phone || '',
      description: item.description || '',
      active: item.active,
      order: item.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот кинотеатр?')) return;

    try {
      const response = await fetch(`/api/cinemas/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Ошибка при удалении');
      await mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка при удалении');
    }
  };

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center"><div className="text-muted-foreground">Загрузка...</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-semibold">Назад</span>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Управление кинотеатрами</h1>
            <button
              onClick={() => { setShowForm(true); setEditingCinema(null); setFormData({ name: '', address: '', latitude: 52.0297, longitude: 113.5006, link: '', phone: '', description: '', active: true, order: 0 }); }}
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
            {cinemas && cinemas.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Кинотеатров пока нет. Добавьте первый!
              </div>
            ) : (
              cinemas?.map((cinema) => (
                <div key={cinema.id} className="bg-card rounded-lg border border-border p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${cinema.active ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                          {cinema.active ? 'Активен' : 'Не активен'}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{cinema.name}</h3>
                      {cinema.link && (
                        <a href={cinema.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-1 inline-block">
                          {cinema.link}
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(cinema)}
                        className="p-2 hover:bg-secondary rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(cinema.id)}
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
                {editingCinema ? 'Редактирование кинотеатра' : 'Добавить кинотеатр'}
              </h2>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Название</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Адрес</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Широта</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Долгота</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Ссылка на сайт</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://..."
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Телефон</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="w-4 h-4 text-primary rounded"
                  disabled={isLoading}
                />
                <label htmlFor="active" className="text-sm text-foreground">Активен</label>
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
