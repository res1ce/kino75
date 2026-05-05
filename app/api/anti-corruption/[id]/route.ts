import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/anti-corruption/[id] - Получить документ по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const document = await prisma.antiCorruption.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching anti-corruption document:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении документа' },
      { status: 500 }
    );
  }
}

// PUT /api/anti-corruption/[id] - Обновить документ
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, fileUrl, fileName, fileSize, category } = body;

    const existingDocument = await prisma.antiCorruption.findUnique({
      where: { id },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      );
    }

    const updatedData: any = {};
    if (title !== undefined) updatedData.title = title;
    if (description !== undefined) updatedData.description = description;
    if (fileUrl !== undefined) updatedData.fileUrl = fileUrl;
    if (fileName !== undefined) updatedData.fileName = fileName;
    if (fileSize !== undefined) updatedData.fileSize = fileSize;
    if (category !== undefined) updatedData.category = category;

    const document = await prisma.antiCorruption.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error updating anti-corruption document:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении документа' },
      { status: 500 }
    );
  }
}

// DELETE /api/anti-corruption/[id] - Удалить документ
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const existingDocument = await prisma.antiCorruption.findUnique({
      where: { id },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      );
    }

    await prisma.antiCorruption.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Документ удалён' });
  } catch (error) {
    console.error('Error deleting anti-corruption document:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении документа' },
      { status: 500 }
    );
  }
}
