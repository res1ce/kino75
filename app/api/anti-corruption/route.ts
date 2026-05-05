import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/anti-corruption - Получить все документы
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');

    const where: any = {};
    
    if (category) {
      where.category = category;
    }

    const skip = page ? (parseInt(page) - 1) * 10 : 0;
    const take = limit ? parseInt(limit) : 10;

    const documents = await prisma.antiCorruption.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take,
    });

    const total = await prisma.antiCorruption.count({ where });

    return NextResponse.json({
      data: documents,
      pagination: {
        total,
        page: page ? parseInt(page) : 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Error fetching anti-corruption documents:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении документов' },
      { status: 500 }
    );
  }
}

// POST /api/anti-corruption - Создать документ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, fileUrl, fileName, fileSize, category } = body;

    if (!title || !fileUrl || !fileName) {
      return NextResponse.json(
        { error: 'Заголовок, файл и имя файла обязательны' },
        { status: 400 }
      );
    }

    const document = await prisma.antiCorruption.create({
      data: {
        title,
        description,
        fileUrl,
        fileName,
        fileSize,
        category,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating anti-corruption document:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании документа' },
      { status: 500 }
    );
  }
}
