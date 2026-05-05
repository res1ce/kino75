import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/cinemas - Получить все кинотеатры
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    const where: any = {};
    
    if (active !== null) {
      where.active = active === 'true';
    }

    const cinemas = await prisma.cinema.findMany({
      where,
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json(cinemas);
  } catch (error) {
    console.error('Error fetching cinemas:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении кинотеатров' },
      { status: 500 }
    );
  }
}

// POST /api/cinemas - Создать кинотеатр
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, latitude, longitude, link, phone, description, imageUrl, order, active } = body;

    if (!name || !address || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Название, адрес и координаты обязательны' },
        { status: 400 }
      );
    }

    const cinema = await prisma.cinema.create({
      data: {
        name,
        address,
        latitude,
        longitude,
        link,
        phone,
        description,
        imageUrl,
        order: order || 0,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json(cinema, { status: 201 });
  } catch (error) {
    console.error('Error creating cinema:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании кинотеатра' },
      { status: 500 }
    );
  }
}
