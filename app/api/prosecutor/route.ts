import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/prosecutor - Получить все разъяснения
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');

    const skip = page ? (parseInt(page) - 1) * 10 : 0;
    const take = limit ? parseInt(limit) : 10;

    const explanations = await prisma.prosecutorExplanation.findMany({
      orderBy: { publishedAt: 'desc' },
      skip,
      take,
    });

    const total = await prisma.prosecutorExplanation.count();

    return NextResponse.json({
      data: explanations,
      pagination: {
        total,
        page: page ? parseInt(page) : 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Error fetching prosecutor explanations:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении разъяснений' },
      { status: 500 }
    );
  }
}

// POST /api/prosecutor - Создать разъяснение
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, content, excerpt } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Заголовок, slug и контент обязательны' },
        { status: 400 }
      );
    }

    const existingExplanation = await prisma.prosecutorExplanation.findUnique({
      where: { slug },
    });

    if (existingExplanation) {
      return NextResponse.json(
        { error: 'Разъяснение с таким slug уже существует' },
        { status: 400 }
      );
    }

    const explanation = await prisma.prosecutorExplanation.create({
      data: {
        title,
        slug,
        content,
        excerpt,
      },
    });

    return NextResponse.json(explanation, { status: 201 });
  } catch (error) {
    console.error('Error creating prosecutor explanation:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании разъяснения' },
      { status: 500 }
    );
  }
}
