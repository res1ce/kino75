'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import useSWR from 'swr';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

interface PageStat {
  path: string;
  count: number;
}

interface RefererStat {
  referer: string;
  count: number;
}

interface BrowserStat {
  name: string;
  count: number;
}

interface VisitData {
  date: string;
  count: number;
}

interface StatsResponse {
  totalVisits: number;
  uniqueVisitors: number;
  pageStats: PageStat[];
  refererStats: RefererStat[];
  browserStats: BrowserStat[];
  visitsByDay: VisitData[];
  visitsByHour: VisitData[] | null;
}

type Period = 'day' | 'week' | 'month' | 'year';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const periodLabels: Record<Period, string> = {
  day: 'День',
  week: 'Неделя',
  month: 'Месяц',
  year: 'Год',
};

const pieColors = ['#111111', '#333333', '#555555', '#707070', '#969696', '#bdbdb8', '#d9d9d6', '#ededeb'];

export default function AdminStatistics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('week');

  const { data: stats, isLoading } = useSWR<StatsResponse>(
    `/api/statistics?period=${period}`,
    fetcher,
    { refreshInterval: 60000 }
  );

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const getPageName = (path: string): string => {
    if (path === '/') return 'Главная';
    const parts = path.split('/').filter(Boolean);
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ') || path;
  };

  const getRefererDomain = (referer: string): string => {
    try {
      if (!referer || referer === 'null') return 'Прямой заход';
      const url = new URL(referer);
      return url.hostname;
    } catch {
      return referer || 'Неизвестно';
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  // Кастомный тултип
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">
            {formatDate(payload[0].payload.date)}
          </p>
          <p className="text-sm text-primary dark:text-primary">
            Просмотров: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-semibold">Назад</span>
            </Link>
            <h1 className="text-xl font-bold">Статистика посещений</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Period Selector */}
        <div className="flex gap-2 mb-8">
          {(Object.keys(periodLabels) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === p
                  ? 'bg-primary text-white'
                  : 'bg-card text-foreground hover:bg-secondary border border-border'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Загрузка статистики...</div>
        ) : stats ? (
          <>
            {/* Summary Cards */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="p-6 bg-card rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">👁️</span>
                  <span className="text-xs text-muted-foreground">Всего просмотров</span>
                </div>
                <div className="text-3xl font-bold text-primary dark:text-primary">
                  {formatNumber(stats.totalVisits)}
                </div>
              </div>

              <div className="p-6 bg-card rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">👥</span>
                  <span className="text-xs text-muted-foreground">Уникальные посетители</span>
                </div>
                <div className="text-3xl font-bold text-primary dark:text-primary">
                  {formatNumber(stats.uniqueVisitors)}
                </div>
              </div>

              <div className="p-6 bg-card rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">📄</span>
                  <span className="text-xs text-muted-foreground">Страниц в статистике</span>
                </div>
                <div className="text-3xl font-bold text-primary dark:text-primary">
                  {stats.pageStats.length}
                </div>
              </div>

              <div className="p-6 bg-card rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">🔗</span>
                  <span className="text-xs text-muted-foreground">Источников</span>
                </div>
                <div className="text-3xl font-bold text-primary dark:text-primary">
                  {stats.refererStats.length}
                </div>
              </div>
            </motion.div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* График посещений */}
              <motion.div
                className="bg-card rounded-lg border border-border p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                <h2 className="text-lg font-semibold mb-4 text-foreground">Динамика посещений</h2>
                {stats.visitsByDay && stats.visitsByDay.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={stats.visitsByDay}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#111111" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#111111" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        stroke="currentColor"
                        className="text-muted-foreground"
                        fontSize={12}
                      />
                      <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#111111"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorCount)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Нет данных для отображения
                  </div>
                )}
              </motion.div>

              {/* Браузеры */}
              <motion.div
                className="bg-card rounded-lg border border-border p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <h2 className="text-lg font-semibold mb-4 text-foreground">Браузеры посетителей</h2>
                {stats.browserStats.some(b => b.count > 0) ? (
                  <div className="flex flex-col items-center gap-4">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={stats.browserStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {stats.browserStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [`${value} просмотров`]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {stats.browserStats.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                          <span className="text-muted-foreground">{entry.name} ({entry.count})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    Нет данных
                  </div>
                )}
              </motion.div>
            </div>

            {/* Топ страниц (Bar Chart) */}
            <motion.div
              className="bg-card rounded-lg border border-border p-6 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h2 className="text-lg font-semibold mb-4 text-foreground">Топ страниц</h2>
              {stats.pageStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.pageStats.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                    <XAxis
                      dataKey="path"
                      tickFormatter={getPageName}
                      stroke="currentColor"
                      className="text-muted-foreground"
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} />
                    <Tooltip
                      formatter={(value: any, name: any, props: any) => [
                        `${formatNumber(value)} просмотров`,
                        getPageName(props.payload.path)
                      ]}
                    />
                    <Bar dataKey="count" fill="#111111" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Нет данных
                </div>
              )}
            </motion.div>

            {/* Источники трафика */}
            <motion.div
              className="bg-card rounded-lg border border-border p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h2 className="text-lg font-semibold mb-4 text-foreground">Источники трафика</h2>
              {stats.refererStats.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.refererStats.map((ref, index) => (
                    <div key={index} className="p-4 bg-secondary/50 rounded-lg">
                      <div className="text-sm font-medium text-foreground truncate mb-1">
                        {getRefererDomain(ref.referer || '')}
                      </div>
                      <div className="text-2xl font-bold text-primary dark:text-primary">
                        {formatNumber(ref.count)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">Нет данных</div>
              )}
            </motion.div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Нет данных для отображения
          </div>
        )}
      </main>
    </div>
  );
}
