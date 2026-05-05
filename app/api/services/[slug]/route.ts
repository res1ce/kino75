import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/services/[slug] - Получить услугу по slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const service = await prisma.service.findUnique({
      where: { slug },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Услуга не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении услуги' },
      { status: 500 }
    );
  }
}

// PUT /api/services/[slug] - Обновить услугу
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { title, description, price, unit, category, order, active } = body;

    const existingService = await prisma.service.findUnique({
      where: { slug },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: 'Услуга не найдена' },
        { status: 404 }
      );
    }

    const updatedData: any = {};
    if (title !== undefined) updatedData.title = title;
    if (description !== undefined) updatedData.description = description;
    if (price !== undefined) updatedData.price = price;
    if (unit !== undefined) updatedData.unit = unit;
    if (category !== undefined) updatedData.category = category;
    if (order !== undefined) updatedData.order = order;
    if (active !== undefined) updatedData.active = active;

    const service = await prisma.service.update({
      where: { slug },
      data: updatedData,
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении услуги' },
      { status: 500 }
    );
  }
}

// DELETE /api/services/[slug] - Удалить услугу
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const existingService = await prisma.service.findUnique({
      where: { slug },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: 'Услуга не найдена' },
        { status: 404 }
      );
    }

    await prisma.service.delete({
      where: { slug },
    });

    return NextResponse.json({ message: 'Услуга удалена' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении услуги' },
      { status: 500 }
    );
  }
}
