import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function parsePublishedAt(value: unknown) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') return null;

  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00.000Z`)
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

// GET /api/news - Получить все новости
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');

    const where: any = {};
    
    if (published !== null) {
      where.published = published === 'true';
    }

    const skip = page ? (parseInt(page) - 1) * 10 : 0;
    const take = limit ? parseInt(limit) : 10;

    const news = await prisma.news.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take,
    });

    const total = await prisma.news.count({ where });

    return NextResponse.json({
      data: news,
      pagination: {
        total,
        page: page ? parseInt(page) : 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении новостей' },
      { status: 500 }
    );
  }
}

// POST /api/news - Создать новость
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, content, excerpt, imageUrl, published, publishedAt } = body;
    const selectedPublishedAt = parsePublishedAt(publishedAt);

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Заголовок, slug и контент обязательны' },
        { status: 400 }
      );
    }

    const existingNews = await prisma.news.findUnique({
      where: { slug },
    });

    if (existingNews) {
      return NextResponse.json(
        { error: 'Новость с таким slug уже существует' },
        { status: 400 }
      );
    }

    const news = await prisma.news.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        imageUrl,
        published: published || false,
        publishedAt: selectedPublishedAt || (published ? new Date() : null),
      },
    });

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании новости' },
      { status: 500 }
    );
  }
}
