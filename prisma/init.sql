-- SQL скрипт для создания базы данных Забайкальской государственной кинокомпании
-- PostgreSQL

-- Создаём enum типы
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR');

-- Таблица пользователей админ-панели
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Таблица новостей
CREATE TABLE "news" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "imageUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- Таблица кинотеатров
CREATE TABLE "cinemas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "link" TEXT,
    "phone" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cinemas_pkey" PRIMARY KEY ("id")
);

-- Таблица противодействия коррупции (файлы)
CREATE TABLE "anti_corruption" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "category" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anti_corruption_pkey" PRIMARY KEY ("id")
);

-- Таблица прокурор разъясняет (тексты)
CREATE TABLE "prosecutor_explanations" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prosecutor_explanations_pkey" PRIMARY KEY ("id")
);

-- Таблица услуг
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "category" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- Таблица контента главной страницы
CREATE TABLE "home_page" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_page_pkey" PRIMARY KEY ("id")
);

-- Таблица настроек доступности
CREATE TABLE "accessibility_settings" (
    "id" TEXT NOT NULL,
    "fontSize" TEXT NOT NULL DEFAULT 'normal',
    "highContrast" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accessibility_settings_pkey" PRIMARY KEY ("id")
);

-- Создаём индексы
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "news_slug_key" ON "news"("slug");
CREATE INDEX "news_publishedAt_idx" ON "news"("publishedAt");
CREATE INDEX "news_published_idx" ON "news"("published");
CREATE INDEX "anti_corruption_publishedAt_idx" ON "anti_corruption"("publishedAt");
CREATE UNIQUE INDEX "prosecutor_explanations_slug_key" ON "prosecutor_explanations"("slug");
CREATE INDEX "prosecutor_explanations_publishedAt_idx" ON "prosecutor_explanations"("publishedAt");
CREATE UNIQUE INDEX "home_page_key_key" ON "home_page"("key");

-- Добавляем начальные данные для главной страницы
INSERT INTO "home_page" ("id", "key", "value", "updatedAt") VALUES
    (gen_random_uuid(), 'hero_title', 'Забайкальская государственная кинокомпания', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'hero_subtitle', 'Искусство кино в сердце Сибири', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'about_title', 'О компании', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'about_content', 'Забайкальская государственная кинокомпания — ведущий производитель кинопродукции в регионе. Мы создаём фильмы, которые вдохновляют.', CURRENT_TIMESTAMP);

-- Добавляем тестового пользователя (пароль: admin123)
-- Хэш пароля для 'admin123' через bcrypt
INSERT INTO "users" ("id", "email", "password", "name", "role", "createdAt", "updatedAt") VALUES
    (gen_random_uuid(), 'admin@kino75.ru', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Администратор', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
