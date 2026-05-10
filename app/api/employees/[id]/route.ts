import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/employees/[id] - Получить сотрудника
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Сотрудник не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении сотрудника' },
      { status: 500 }
    );
  }
}

// PUT /api/employees/[id] - Обновить сотрудника
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, position, photoUrl, order, active } = body;

    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Сотрудник не найден' },
        { status: 404 }
      );
    }

    const updatedData: {
      name?: string;
      position?: string;
      photoUrl?: string | null;
      order?: number;
      active?: boolean;
    } = {};

    if (name !== undefined) updatedData.name = name;
    if (position !== undefined) updatedData.position = position;
    if (photoUrl !== undefined) updatedData.photoUrl = photoUrl || null;
    if (order !== undefined) updatedData.order = Number(order);
    if (active !== undefined) updatedData.active = Boolean(active);

    const employee = await prisma.employee.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении сотрудника' },
      { status: 500 }
    );
  }
}

// DELETE /api/employees/[id] - Удалить сотрудника
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Сотрудник не найден' },
        { status: 404 }
      );
    }

    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Сотрудник удалён' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении сотрудника' },
      { status: 500 }
    );
  }
}
