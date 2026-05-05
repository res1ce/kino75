import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/services - Получить все услуги
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const category = searchParams.get('category');

    const where: any = {};
    
    if (active !== null) {
      where.active = active === 'true';
    }
    
    if (category) {
      where.category = category;
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: [{ order: 'asc' }, { title: 'asc' }],
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении услуг' },
      { status: 500 }
    );
  }
}

// POST /api/services - Создать услугу
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, description, price, unit, category, order, active } = body;

    if (!title || !slug || price === undefined) {
      return NextResponse.json(
        { error: 'Название, slug и цена обязательны' },
        { status: 400 }
      );
    }

    const existingService = await prisma.service.findUnique({
      where: { slug },
    });

    if (existingService) {
      return NextResponse.json(
        { error: 'Услуга с таким slug уже существует' },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        title,
        slug,
        description,
        price,
        unit,
        category,
        order: order || 0,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании услуги' },
      { status: 500 }
    );
  }
}
