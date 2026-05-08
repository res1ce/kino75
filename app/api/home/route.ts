import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Данные по умолчанию для заполнения при отсутствии в БД
const defaultData: Record<string, string> = {
  hero_title: 'Забайкальская государственная кинокомпания',
  hero_subtitle: 'Искусство кино в сердце Сибири',
  about_title: 'О компании',
  about_content: 'Забайкальская государственная кинокомпания — ведущий производитель кинопродукции в регионе, работающий с 1975 года. Мы создаём фильмы, которые вдохновляют, информируют и объединяют людей.\n\nНаша миссия — развитие кинокультуры в Забайкальском крае, поддержка местных талантов и создание качественного контента для зрителей всех возрастов.',
  stats_years_value: '50+',
  stats_years_label: 'лет истории',
  stats_films_value: '200+',
  stats_films_label: 'фильмов',
  stats_cinemas_value: '15',
  stats_cinemas_label: 'кинотеатров',
  stats_viewers_value: '50K+',
  stats_viewers_label: 'зрителей',
  footer_description: 'Искусство кино в сердце Забайкалья',
  footer_address: 'г. Чита, ул. Ленина, 1',
  footer_phone: '+7 (3022) 00-00-00',
  footer_email: 'info@kino75.ru',
  footer_socials: '[]',
};

export async function GET() {
  try {
    const homePageData = await prisma.homePage.findMany();
    
    // Преобразуем массив в объект
    const result = Object.fromEntries(homePageData.map(item => [item.key, item.value]));
    
    // Merge с defaultData для отсутствующих ключей
    const mergedData = { ...defaultData, ...result };
    
    return NextResponse.json(mergedData);
  } catch (error) {
    console.error('Error fetching home page data:', error);
    // Возвращаем данные по умолчанию при ошибке
    return NextResponse.json(defaultData);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updates: { key: string; value: string }[] = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Ожидается массив данных' },
        { status: 400 }
      );
    }

    // Обновляем или создаём записи
    const results = await Promise.all(
      updates.map(async ({ key, value }) => {
        return prisma.homePage.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      })
    );

    const result = Object.fromEntries(results.map(item => [item.key, item.value]));
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating home page data:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении данных главной страницы' },
      { status: 500 }
    );
  }
}
