# Забайкальская государственная кинокомпания

Современный сайт кинокомпании с админ-панелью, созданный на Next.js 16, TypeScript, Prisma, Tailwind CSS.

## 🚀 Технологии

- **Next.js 16** - React фреймворк с App Router
- **TypeScript** - типизация
- **Prisma** - ORM для работы с базой данных
- **PostgreSQL** - база данных
- **Tailwind CSS 4** - стилизация
- **Framer Motion** - анимации
- **NextAuth.js** - аутентификация
- **TipTap** - WYSIWYG редактор

## 📋 Требования

- Node.js 20+
- PostgreSQL 14+
- npm/pnpm

## 🛠️ Установка

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка базы данных

Создайте базу данных PostgreSQL:

```sql
CREATE DATABASE kino75;
CREATE USER kino_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE kino75 TO kino_user;
```

### 3. Настройка переменных окружения

Скопируйте `.env.example` в `.env`:

```bash
cp .env.example .env
```

Отредактируйте `.env`:
- `DATABASE_URL` - строка подключения к PostgreSQL
- `NEXTAUTH_SECRET` - секретный ключ (сгенерируйте через `openssl rand -base64 32`)

### 4. Инициализация базы данных

```bash
# Генерация Prisma клиента
npm run db:generate

# Создание таблиц в БД (вариант 1 - через Prisma)
npm run db:push

# ИЛИ вариант 2 - через SQL скрипт
psql -U kino_user -d kino75 -f prisma/init.sql
```

### 5. Запуск разработки

```bash
npm run dev
```

Сайт доступен по адресу: http://localhost:3000

## 📁 Структура проекта

```
kino75/
├── app/
│   ├── admin/          # Админ-панель
│   ├── api/            # API роуты
│   ├── anti-corruption/# Противодействие коррупции
│   ├── cinemas/        # Кинотеатры
│   ├── news/           # Новости
│   ├── prosecutor/     # Прокурор разъясняет
│   ├── services/       # Услуги
│   ├── layout.tsx      # Основной layout
│   └── page.tsx        # Главная страница
├── components/
│   ├── Header.tsx      # Шапка
│   ├── Footer.tsx      # Подвал
│   └── ui/             # UI компоненты
├── lib/
│   ├── prisma.ts       # Prisma клиент
│   └── accessibility.tsx # Доступность
├── prisma/
│   ├── schema.prisma   # Prisma схема
│   └── init.sql        # SQL скрипт
└── public/             # Статические файлы
```

## 🎨 Функции

### Публичная часть
1. **Главная страница** - анимированный hero-блок, преимущества, статистика
2. **Кинотеатры** - список с Яндекс.Картой (без API ключа)
3. **Новости** - с архивом по месяцам
4. **Услуги** - карточки с ценами
5. **Противодействие коррупции** - файлы законов
6. **Прокурор разъясняет** - тексты законов

### Админ-панель (`/admin`)
- Авторизация через NextAuth
- Редактирование новостей (WYSIWYG редактор)
- Управление кинотеатрами
- Управление услугами
- Загрузка документов
- Редактирование главной страницы

### Доступность
- 🌓 Тёмная/светлая тема
- 👁️ Версия для слабовидящих
- 🔤 Изменение размера шрифта
- 🔴 Высокий контраст

## 🎬 Админ-панель

### Вход
- URL: http://localhost:3000/admin/login
- Email: `admin@kino75.ru`
- Пароль: `admin123`

### Разделы
- `/admin/news` - Новости
- `/admin/cinemas` - Кинотеатры
- `/admin/services` - Услуги
- `/admin/anti-corruption` - Документы
- `/admin/prosecutor` - Разъяснения
- `/admin/home` - Главная страница

## 🗄️ База данных

### Таблицы
- `users` - пользователи админ-панели
- `news` - новости
- `cinemas` - кинотеатры
- `services` - услуги
- `anti_corruption` - документы
- `prosecutor_explanations` - разъяснения
- `home_page` - контент главной
- `accessibility_settings` - настройки доступности

### Prisma команды
```bash
npm run db:generate  # Генерация клиента
npm run db:push      # Синхронизация схемы
npm run db:studio    # Prisma Studio (GUI)
```

## 🎨 Цветовая палитра

Багровая тема:
- `--burgundy-50` до `--burgundy-950`
- Основной: `#7f1d1d` (burgundy-700)
- Акцент: `#b91c1c` (burgundy-600)

## 📦 Развёртывание

### Production сборка
```bash
npm run build
npm run start
```

### Переменные окружения для production
- Установите `NEXTAUTH_URL` в ваш домен
- Сгенерируйте новый `NEXTAUTH_SECRET`
- Настройте подключение к production БД

## 🔧 Дополнительные пакеты

Все необходимые пакеты уже указаны в `package.json`. Для установки:

```bash
npm install
```

Основные зависимости:
- `@prisma/client`, `prisma` - работа с БД
- `next-auth` - аутентификация
- `bcryptjs` - хеширование паролей
- `framer-motion` - анимации
- `@tiptap/*` - редактор текста
- `react-hook-form`, `zod` - формы и валидация

## 📝 Лицензия

© 2024 Забайкальская государственная кинокомпания
