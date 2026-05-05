import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем сидирование базы данных...');

  // Создаём администратора
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kino75.ru' },
    update: {},
    create: {
      email: 'admin@kino75.ru',
      password: hashedPassword,
      name: 'Администратор',
      role: 'ADMIN',
    },
  });
  console.log('✅ Пользователь admin@kino75.ru создан');

  // Данные для главной страницы
  const homePageData = [
    { key: 'hero_title', value: 'Забайкальская государственная кинокомпания' },
    { key: 'hero_subtitle', value: 'Искусство кино в сердце Сибири' },
    { key: 'about_title', value: 'О компании' },
    { key: 'about_content', value: 'Забайкальская государственная кинокомпания — ведущий производитель кинопродукции в регионе, работающий с 1975 года. Мы создаём фильмы, которые вдохновляют, информируют и объединяют людей.\n\nНаша миссия — развитие кинокультуры в Забайкальском крае, поддержка местных талантов и создание качественного контента для зрителей всех возрастов.' },
    { key: 'stats_years_value', value: '50+' },
    { key: 'stats_years_label', value: 'лет истории' },
    { key: 'stats_films_value', value: '200+' },
    { key: 'stats_films_label', value: 'фильмов' },
    { key: 'stats_cinemas_value', value: '15' },
    { key: 'stats_cinemas_label', value: 'кинотеатров' },
    { key: 'stats_viewers_value', value: '50K+' },
    { key: 'stats_viewers_label', value: 'зрителей' },
  ];

  for (const item of homePageData) {
    await prisma.homePage.upsert({
      where: { key: item.key },
      update: { value: item.value },
      create: item,
    });
  }
  console.log('✅ Данные главной страницы созданы');

  // Новости
  const newsData = [
    {
      title: 'Премьера фильма "Забайкальские истории" состоится в декабре',
      slug: 'premera-zabaikalskie-istorii',
      content: '<p>15 декабря в кинотеатре "Звезда" состоится премьера нового фильма Забайкальской кинокомпании "Забайкальские истории". Режиссёр картины — Иван Петров, известный по фильмам "Тайга" и "Степной волк".</p><p>Фильм рассказывает о жизни современных жителей Забайкалья, их мечтах и стремлениях.</p>',
      excerpt: '15 декабря в кинотеатре "Звезда" состоится премьера нового фильма...',
      published: true,
      publishedAt: new Date('2024-02-20'),
    },
    {
      title: 'Кинокомпания получила грант на производство документального фильма',
      slug: 'grant-dokumentalnyy-film',
      content: '<p>Забайкальская государственная кинокомпания стала победителем конкурса Фонда кино с проектом документального фильма "Великий чайный путь".</p>',
      excerpt: 'Проект стал победителем конкурса Фонда кино...',
      published: true,
      publishedAt: new Date('2024-02-15'),
    },
    {
      title: 'Открылся приём заявок на кинофестиваль "Амурская осень"',
      slug: 'festival-amurskaya-osen',
      content: '<p>Забайкальская кинокомпания объявляет о начале приёма заявок на участие в ежегодном кинофестивале "Амурская осень".</p>',
      excerpt: 'Фестиваль пройдёт с 15 по 20 сентября 2024 года...',
      published: true,
      publishedAt: new Date('2024-02-10'),
    },
  ];

  for (const item of newsData) {
    await prisma.news.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }
  console.log('✅ Новости созданы');

  // Кинотеатры
  const cinemasData = [
    {
      name: 'Кинотеатр "Звезда"',
      address: 'г. Чита, ул. Ленина, 15',
      latitude: 52.0297,
      longitude: 113.5006,
      link: 'https://kino-zvezda.ru',
      phone: '+7 (3022) 11-11-11',
      description: 'Современный кинотеатр с 5 залами и системой Dolby Atmos',
      order: 1,
    },
    {
      name: 'Кинотеатр "Победа"',
      address: 'г. Чита, пр. Ленина, 32',
      latitude: 52.0350,
      longitude: 113.5100,
      link: 'https://kino-pobeda.ru',
      phone: '+7 (3022) 22-22-22',
      description: 'Старейший кинотеатр города с отреставрированным залом',
      order: 2,
    },
    {
      name: 'Кинотеатр "Сибирь"',
      address: 'г. Чита, ул. Бабушкина, 45',
      latitude: 52.0200,
      longitude: 113.4900,
      phone: '+7 (3022) 33-33-33',
      description: 'Уютный кинотеатр с демократичными ценами',
      order: 3,
    },
  ];

  for (const item of cinemasData) {
    const existing = await prisma.cinema.findFirst({ where: { name: item.name } });
    if (existing) {
      await prisma.cinema.update({ where: { id: existing.id }, data: item });
    } else {
      await prisma.cinema.create({ data: item });
    }
  }
  console.log('✅ Кинотеатры созданы');

  // Услуги
  const servicesData = [
    {
      title: 'Аренда киносъёмочной техники',
      slug: 'arenda-tehniki',
      description: 'Предоставление профессиональной съёмочной техники для кинопроизводства',
      price: 50000,
      unit: 'смена',
      category: 'Оборудование',
      order: 1,
    },
    {
      title: 'Предоставление павильона',
      slug: 'pavilon',
      description: 'Киносъёмочный павильон площадью 500 м² с современным оборудованием',
      price: 100000,
      unit: 'смена',
      category: 'Площадки',
      order: 2,
    },
    {
      title: 'Услуги кинокомиссии',
      slug: 'kinokomissiya',
      description: 'Сопровождение съёмок на природных и городских локациях Забайкалья',
      price: 25000,
      unit: 'проект',
      category: 'Сервис',
      order: 3,
    },
    {
      title: 'Полный цикл постпродакшна',
      slug: 'postproduction',
      description: 'Монтаж, цветокоррекция, звуковое оформление вашего фильма',
      price: 200000,
      unit: 'проект',
      category: 'Постпродакшн',
      order: 4,
    },
  ];

  for (const item of servicesData) {
    await prisma.service.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }
  console.log('✅ Услуги созданы');

  console.log('🎉 Сидирование завершено успешно!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при сидировании:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
