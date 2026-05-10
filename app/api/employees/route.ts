import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/employees - Получить сотрудников
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const where: { active?: boolean } = {};

    if (active !== null) {
      where.active = active === 'true';
    }

    const employees = await prisma.employee.findMany({
      where,
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении сотрудников' },
      { status: 500 }
    );
  }
}

// POST /api/employees - Создать сотрудника
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, position, photoUrl, order, active } = body;

    if (!name || !position) {
      return NextResponse.json(
        { error: 'Имя и должность обязательны' },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        position,
        photoUrl: photoUrl || null,
        order: Number.isFinite(Number(order)) ? Number(order) : 0,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании сотрудника' },
      { status: 500 }
    );
  }
}
