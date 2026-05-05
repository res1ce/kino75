import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/prosecutor/[slug] - Получить разъяснение по slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const explanation = await prisma.prosecutorExplanation.findUnique({
      where: { slug },
    });

    if (!explanation) {
      return NextResponse.json(
        { error: 'Разъяснение не найдено' },
        { status: 404 }
      );
    }

    return NextResponse.json(explanation);
  } catch (error) {
    console.error('Error fetching prosecutor explanation:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении разъяснения' },
      { status: 500 }
    );
  }
}

// PUT /api/prosecutor/[slug] - Обновить разъяснение
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { title, content, excerpt } = body;

    const existingExplanation = await prisma.prosecutorExplanation.findUnique({
      where: { slug },
    });

    if (!existingExplanation) {
      return NextResponse.json(
        { error: 'Разъяснение не найдено' },
        { status: 404 }
      );
    }

    const updatedData: any = {};
    if (title !== undefined) updatedData.title = title;
    if (content !== undefined) updatedData.content = content;
    if (excerpt !== undefined) updatedData.excerpt = excerpt;

    const explanation = await prisma.prosecutorExplanation.update({
      where: { slug },
      data: updatedData,
    });

    return NextResponse.json(explanation);
  } catch (error) {
    console.error('Error updating prosecutor explanation:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении разъяснения' },
      { status: 500 }
    );
  }
}

// DELETE /api/prosecutor/[slug] - Удалить разъяснение
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const existingExplanation = await prisma.prosecutorExplanation.findUnique({
      where: { slug },
    });

    if (!existingExplanation) {
      return NextResponse.json(
        { error: 'Разъяснение не найдено' },
        { status: 404 }
      );
    }

    await prisma.prosecutorExplanation.delete({
      where: { slug },
    });

    return NextResponse.json({ message: 'Разъяснение удалено' });
  } catch (error) {
    console.error('Error deleting prosecutor explanation:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении разъяснения' },
      { status: 500 }
    );
  }
}
