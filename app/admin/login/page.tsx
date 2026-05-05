'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { easeOut } from '../../_components/BrandPrimitives';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch {
      setError('Произошла ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4 py-12 film-grain">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(17,17,17,0.08),transparent_38%),linear-gradient(315deg,rgba(128,128,128,0.1),transparent_44%)]" />
      <motion.div
        initial={{ opacity: 0, y: 26, clipPath: 'inset(12% 0 0 0)' }}
        animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0 0)' }}
        transition={{ duration: 0.65, ease: easeOut }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="cinema-card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-primary text-white flex items-center justify-center font-black text-2xl">
              75
            </div>
            <h1 className="text-2xl font-black text-foreground">Админ-панель</h1>
            <p className="text-muted-foreground mt-2">Забайкальская кинокомпания</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-secondary border border-border rounded-lg text-foreground text-sm"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="soft-input px-4 py-3"
                placeholder="admin@kino75.ru"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="soft-input px-4 py-3"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full px-6 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Тестовые данные:</p>
            <p className="mt-1">Email: admin@kino75.ru</p>
            <p>Пароль: admin123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
