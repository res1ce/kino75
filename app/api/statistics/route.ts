import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - запись нового посещения
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, userAgent, ip, referer } = body;

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    await prisma.visitStats.create({
      data: {
        path,
        userAgent: userAgent || null,
        ip: ip || null,
        referer: referer || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording visit:', error);
    return NextResponse.json({ error: 'Failed to record visit' }, { status: 500 });
  }
}

// GET - получение статистики
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week';

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Общее количество посещений за период
    const totalVisits = await prisma.visitStats.count({
      where: {
        visitedAt: {
          gte: startDate,
        },
      },
    });

    // Уникальные посетители (по IP)
    const uniqueVisitors = await prisma.visitStats.groupBy({
      by: ['ip'],
      where: {
        visitedAt: {
          gte: startDate,
        },
        ip: {
          not: null,
        },
      },
      _count: true,
    });

    // Статистика по страницам
    const pageStats = await prisma.visitStats.groupBy({
      by: ['path'],
      where: {
        visitedAt: {
          gte: startDate,
        },
      },
      _count: true,
      orderBy: {
        _count: {
          path: 'desc',
        },
      },
      take: 10,
    });

    // Статистика по реферерам
    const refererStats = await prisma.visitStats.groupBy({
      by: ['referer'],
      where: {
        visitedAt: {
          gte: startDate,
        },
        referer: {
          not: null,
        },
      },
      _count: true,
      orderBy: {
        _count: {
          referer: 'desc',
        },
      },
      take: 10,
    });

    // Статистика по браузерам (из userAgent)
    const allVisits = await prisma.visitStats.findMany({
      where: {
        visitedAt: {
          gte: startDate,
        },
        userAgent: {
          not: null,
        },
      },
      select: {
        userAgent: true,
      },
    });

    const browserCounts: Record<string, number> = {
      Chrome: 0,
      Firefox: 0,
      Safari: 0,
      Edge: 0,
      Other: 0,
    };

    allVisits.forEach((visit) => {
      const ua = visit.userAgent || '';
      if (ua.includes('Edg')) {
        browserCounts.Edge++;
      } else if (ua.includes('Chrome')) {
        browserCounts.Chrome++;
      } else if (ua.includes('Firefox')) {
        browserCounts.Firefox++;
      } else if (ua.includes('Safari')) {
        browserCounts.Safari++;
      } else {
        browserCounts.Other++;
      }
    });

    // Посещения по дням (для графика)
    const visitsByDayRaw = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC('day', "visitedAt") as date,
        COUNT(*) as count
      FROM "visit_stats"
      WHERE "visitedAt" >= ${startDate}
      GROUP BY DATE_TRUNC('day', "visitedAt")
      ORDER BY date ASC
    `;

    // Посещения по часам (для последних 24 часов)
    const visitsByHourRaw = period === 'day' ? await prisma.$queryRaw`
      SELECT
        DATE_TRUNC('hour', "visitedAt") as hour,
        COUNT(*) as count
      FROM "visit_stats"
      WHERE "visitedAt" >= ${startDate}
      GROUP BY DATE_TRUNC('hour', "visitedAt")
      ORDER BY hour ASC
    ` : null;

    // Преобразуем BigInt в Number (PostgreSQL возвращает BigInt в raw запросах)
    const visitsByDay = (visitsByDayRaw as Array<{ date: Date; count: bigint | number }>).map(item => ({
      date: item.date.toISOString(),
      count: Number(item.count),
    }));

    const visitsByHour = visitsByHourRaw
      ? (visitsByHourRaw as Array<{ hour: Date; count: bigint | number }>).map(item => ({
          date: item.hour.toISOString(),
          count: Number(item.count),
        }))
      : null;

    // Функция для извлечения count из groupBy результата
    const getCount = (item: any): number => {
      const countObj = item._count;
      if (!countObj) return 0;
      // Находим первое числовое значение в объекте _count
      const key = Object.keys(countObj)[0];
      const val = countObj[key];
      return typeof val === 'bigint' ? Number(val) : (val || 0);
    };

    return NextResponse.json({
      totalVisits: typeof totalVisits === 'bigint' ? Number(totalVisits) : totalVisits,
      uniqueVisitors: uniqueVisitors.length,
      pageStats: pageStats.map((item) => ({
        path: item.path,
        count: getCount(item),
      })),
      refererStats: refererStats.map((item) => ({
        referer: item.referer,
        count: getCount(item),
      })),
      browserStats: Object.entries(browserCounts).map(([name, count]) => ({
        name,
        count,
      })),
      visitsByDay,
      visitsByHour,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
