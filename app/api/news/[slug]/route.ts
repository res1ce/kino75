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

// GET /api/news/[slug] - Получить новость по slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const news = await prisma.news.findUnique({
      where: { slug },
    });

    if (!news) {
      return NextResponse.json(
        { error: 'Новость не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении новости' },
      { status: 500 }
    );
  }
}

// PUT /api/news/[slug] - Обновить новость
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { title, slug: nextSlug, content, excerpt, imageUrl, published, publishedAt } = body;

    const existingNews = await prisma.news.findUnique({
      where: { slug },
    });

    if (!existingNews) {
      return NextResponse.json(
        { error: 'Новость не найдена' },
        { status: 404 }
      );
    }

    const updatedData: any = {};
    if (title !== undefined) updatedData.title = title;
    if (nextSlug !== undefined && nextSlug !== slug) {
      const duplicateNews = await prisma.news.findUnique({
        where: { slug: nextSlug },
      });

      if (duplicateNews) {
        return NextResponse.json(
          { error: 'РќРѕРІРѕСЃС‚СЊ СЃ С‚Р°РєРёРј slug СѓР¶Рµ СЃСѓС‰РµСЃС‚РІСѓРµС‚' },
          { status: 400 }
        );
      }

      updatedData.slug = nextSlug;
    }
    if (content !== undefined) updatedData.content = content;
    if (excerpt !== undefined) updatedData.excerpt = excerpt;
    if (imageUrl !== undefined) updatedData.imageUrl = imageUrl;
    if (publishedAt !== undefined) updatedData.publishedAt = parsePublishedAt(publishedAt);
    if (published !== undefined) {
      updatedData.published = published;
      if (published && !updatedData.publishedAt) {
        updatedData.publishedAt = existingNews.publishedAt || new Date();
      }
      if (!published) {
        updatedData.publishedAt = null;
      }
    }

    const news = await prisma.news.update({
      where: { slug },
      data: updatedData,
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении новости' },
      { status: 500 }
    );
  }
}

// DELETE /api/news/[slug] - Удалить новость
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const existingNews = await prisma.news.findUnique({
      where: { slug },
    });

    if (!existingNews) {
      return NextResponse.json(
        { error: 'Новость не найдена' },
        { status: 404 }
      );
    }

    await prisma.news.delete({
      where: { slug },
    });

    return NextResponse.json({ message: 'Новость удалена' });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении новости' },
      { status: 500 }
    );
  }
}
