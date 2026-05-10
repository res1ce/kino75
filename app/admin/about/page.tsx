'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';

type TabId = 'company' | 'employees';

interface AboutData {
  about_title: string;
  about_content: string;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  photoUrl?: string | null;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmployeeFormData {
  name: string;
  position: string;
  photoUrl: string;
  order: number;
  active: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const tabs: { id: TabId; label: string }[] = [
  { id: 'company', label: 'О компании' },
  { id: 'employees', label: 'Сотрудники' },
];

const emptyEmployeeForm: EmployeeFormData = {
  name: '',
  position: '',
  photoUrl: '',
  order: 0,
  active: true,
};

export default function AdminAboutPage() {
  const { status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('company');
  const [aboutDraft, setAboutDraft] = useState<Partial<AboutData>>({});
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeForm, setEmployeeForm] = useState<EmployeeFormData>(emptyEmployeeForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: homeData, mutate: mutateHome } = useSWR<AboutData>('/api/home', fetcher);
  const { data: employees, mutate: mutateEmployees } = useSWR<Employee[]>('/api/employees', fetcher);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const aboutTitle = aboutDraft.about_title ?? homeData?.about_title ?? '';
  const aboutContent = aboutDraft.about_content ?? homeData?.about_content ?? '';

  const showSuccess = () => {
    setSuccess(true);
    window.setTimeout(() => setSuccess(false), 3000);
  };

  const saveAbout = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { key: 'about_title', value: aboutTitle },
          { key: 'about_content', value: aboutContent },
        ]),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при сохранении');
      }

      setAboutDraft({});
      await mutateHome();
      showSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsSaving(false);
    }
  };

  const openCreateEmployee = () => {
    setEditingEmployee(null);
    setEmployeeForm(emptyEmployeeForm);
    setShowEmployeeForm(true);
    setActiveTab('employees');
  };

  const openEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setEmployeeForm({
      name: employee.name,
      position: employee.position,
      photoUrl: employee.photoUrl || '',
      order: employee.order,
      active: employee.active,
    });
    setShowEmployeeForm(true);
    setActiveTab('employees');
  };

  const saveEmployee = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : '/api/employees';
      const method = editingEmployee ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при сохранении сотрудника');
      }

      await mutateEmployees();
      setShowEmployeeForm(false);
      setEditingEmployee(null);
      setEmployeeForm(emptyEmployeeForm);
      showSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEmployee = async (id: string) => {
    if (!confirm('Удалить сотрудника?')) return;

    setError(null);

    try {
      const response = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при удалении');
      }

      await mutateEmployees();
      showSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при удалении');
    }
  };

  const uploadEmployeePhoto = async (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Выберите файл изображения');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'employees');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при загрузке фотографии');
      }

      setEmployeeForm((prev) => ({ ...prev, photoUrl: data.fileUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке фотографии');
    } finally {
      setIsUploading(false);
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
          <div className="flex items-center justify-between gap-4">
            <Link href="/admin" className="flex items-center gap-3">
              <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-semibold">Назад</span>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Раздел «О нас»</h1>
            <button
              onClick={openCreateEmployee}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium"
              type="button"
            >
              + Сотрудник
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
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

        <div className="mb-6 flex flex-wrap gap-2 rounded-lg border border-border bg-card p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
                activeTab === tab.id ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'company' && (
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-lg border border-border p-6"
          >
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Заголовок</label>
                <input
                  type="text"
                  value={aboutTitle}
                  onChange={(event) => setAboutDraft((prev) => ({ ...prev, about_title: event.target.value }))}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Текст</label>
                <textarea
                  value={aboutContent}
                  onChange={(event) => setAboutDraft((prev) => ({ ...prev, about_content: event.target.value }))}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={10}
                  disabled={isSaving}
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={saveAbout}
                  disabled={isSaving}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  type="button"
                >
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {activeTab === 'employees' && (
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            {showEmployeeForm ? (
              <form onSubmit={saveEmployee} className="max-w-3xl bg-card rounded-lg border border-border p-6 space-y-5">
                <h2 className="text-xl font-semibold text-foreground">
                  {editingEmployee ? 'Редактирование сотрудника' : 'Добавить сотрудника'}
                </h2>

                <div className="grid gap-5 md:grid-cols-[180px_1fr]">
                  <div>
                    <div className="aspect-[4/5] rounded-lg border border-border bg-secondary overflow-hidden flex items-center justify-center text-3xl font-black text-primary/35 relative">
                      {employeeForm.photoUrl ? (
                        <Image src={employeeForm.photoUrl} alt="" fill sizes="180px" className="object-cover" />
                      ) : (
                        getInitials(employeeForm.name || 'С')
                      )}
                    </div>
                    <label className="mt-3 block text-center px-4 py-2 bg-secondary hover:bg-muted rounded-lg text-sm font-medium cursor-pointer">
                      {isUploading ? 'Загрузка...' : 'Загрузить фото'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        disabled={isUploading || isSaving}
                        onChange={(event) => {
                          void uploadEmployeePhoto(event.target.files?.[0]);
                          event.currentTarget.value = '';
                        }}
                      />
                    </label>
                    {employeeForm.photoUrl && (
                      <button
                        onClick={() => setEmployeeForm((prev) => ({ ...prev, photoUrl: '' }))}
                        className="mt-2 w-full px-4 py-2 bg-secondary hover:bg-muted rounded-lg text-sm font-medium"
                        type="button"
                        disabled={isSaving}
                      >
                        Убрать фото
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Имя</label>
                      <input
                        type="text"
                        value={employeeForm.name}
                        onChange={(event) => setEmployeeForm((prev) => ({ ...prev, name: event.target.value }))}
                        className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Должность</label>
                      <input
                        type="text"
                        value={employeeForm.position}
                        onChange={(event) => setEmployeeForm((prev) => ({ ...prev, position: event.target.value }))}
                        className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Ссылка на фото</label>
                      <input
                        type="text"
                        value={employeeForm.photoUrl}
                        onChange={(event) => setEmployeeForm((prev) => ({ ...prev, photoUrl: event.target.value }))}
                        className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="/uploads/employees/photo.webp"
                        disabled={isSaving}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Порядок</label>
                        <input
                          type="number"
                          value={employeeForm.order}
                          onChange={(event) => setEmployeeForm((prev) => ({ ...prev, order: Number(event.target.value) }))}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          disabled={isSaving}
                        />
                      </div>
                      <label className="flex items-center gap-2 self-end rounded-lg bg-secondary border border-border px-4 py-3">
                        <input
                          type="checkbox"
                          checked={employeeForm.active}
                          onChange={(event) => setEmployeeForm((prev) => ({ ...prev, active: event.target.checked }))}
                          className="w-4 h-4 text-primary rounded"
                          disabled={isSaving}
                        />
                        <span className="text-sm text-foreground">Показывать на сайте</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmployeeForm(false)}
                    disabled={isSaving}
                    className="px-6 py-3 bg-secondary hover:bg-muted text-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {employees && employees.length === 0 ? (
                  <div className="bg-card rounded-lg border border-border p-10 text-center text-muted-foreground">
                    Сотрудники пока не добавлены.
                  </div>
                ) : (
                  employees?.map((employee) => (
                    <div key={employee.id} className="bg-card rounded-lg border border-border p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-20 rounded-lg bg-secondary border border-border overflow-hidden flex items-center justify-center text-xl font-black text-primary/35 relative">
                            {employee.photoUrl ? (
                              <Image src={employee.photoUrl} alt="" fill sizes="64px" className="object-cover" />
                            ) : (
                              getInitials(employee.name)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${employee.active ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                                {employee.active ? 'Показывается' : 'Скрыт'}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">{employee.name}</h3>
                            <p className="text-sm text-muted-foreground">{employee.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditEmployee(employee)}
                            className="p-2 hover:bg-secondary rounded-lg"
                            type="button"
                            title="Редактировать"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => void deleteEmployee(employee.id)}
                            className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground"
                            type="button"
                            title="Удалить"
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
              </div>
            )}
          </motion.section>
        )}
      </main>
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
