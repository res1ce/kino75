import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/cinemas/[id] - Получить кинотеатр по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const cinema = await prisma.cinema.findUnique({
      where: { id },
    });

    if (!cinema) {
      return NextResponse.json(
        { error: 'Кинотеатр не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(cinema);
  } catch (error) {
    console.error('Error fetching cinema:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении кинотеатра' },
      { status: 500 }
    );
  }
}

// PUT /api/cinemas/[id] - Обновить кинотеатр
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, address, latitude, longitude, link, phone, description, imageUrl, order, active } = body;

    const existingCinema = await prisma.cinema.findUnique({
      where: { id },
    });

    if (!existingCinema) {
      return NextResponse.json(
        { error: 'Кинотеатр не найден' },
        { status: 404 }
      );
    }

    const updatedData: any = {};
    if (name !== undefined) updatedData.name = name;
    if (address !== undefined) updatedData.address = address;
    if (latitude !== undefined) updatedData.latitude = latitude;
    if (longitude !== undefined) updatedData.longitude = longitude;
    if (link !== undefined) updatedData.link = link;
    if (phone !== undefined) updatedData.phone = phone;
    if (description !== undefined) updatedData.description = description;
    if (imageUrl !== undefined) updatedData.imageUrl = imageUrl;
    if (order !== undefined) updatedData.order = order;
    if (active !== undefined) updatedData.active = active;

    const cinema = await prisma.cinema.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json(cinema);
  } catch (error) {
    console.error('Error updating cinema:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении кинотеатра' },
      { status: 500 }
    );
  }
}

// DELETE /api/cinemas/[id] - Удалить кинотеатр
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const existingCinema = await prisma.cinema.findUnique({
      where: { id },
    });

    if (!existingCinema) {
      return NextResponse.json(
        { error: 'Кинотеатр не найден' },
        { status: 404 }
      );
    }

    await prisma.cinema.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Кинотеатр удалён' });
  } catch (error) {
    console.error('Error deleting cinema:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении кинотеатра' },
      { status: 500 }
    );
  }
}
