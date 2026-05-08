# Деплой на Timeweb VPS/Cloud по IP

Эта инструкция рассчитана на Timeweb Cloud Server/VPS с Ubuntu 22.04/24.04. Для обычного виртуального хостинга без Node.js и PostgreSQL этот проект не подходит: сайт динамический, использует Next.js, Prisma, PostgreSQL и NextAuth.

Пока домен не привязан, сайт будет открываться по `http://SERVER_IP`. Когда домен будет готов, нужно будет заменить `NEXTAUTH_URL` и конфиг Nginx.

## 1. Что создать в Timeweb

1. Создайте Cloud Server/VPS с Ubuntu 22.04 или 24.04.
2. Минимально комфортно: 2 CPU, 2 GB RAM, 20+ GB NVMe. Для теста можно слабее, но сборка Next.js любит память.
3. В панели Timeweb возьмите IP, логин `root` и пароль или добавьте SSH-ключ.
4. Подключитесь с компьютера:

```bash
ssh root@SERVER_IP
```

## 2. Подготовка сервера

```bash
apt update && apt upgrade -y
apt install -y curl git nginx postgresql postgresql-contrib ufw
```

Установите Node.js 22 и pnpm:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
corepack enable
corepack prepare pnpm@9 --activate
npm install -g pm2
```

Откройте только SSH и HTTP:

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

## 3. База данных

```bash
sudo -u postgres psql
```

Внутри `psql`:

```sql
CREATE DATABASE kino75;
CREATE USER kino75_user WITH ENCRYPTED PASSWORD 'CHANGE_STRONG_DB_PASSWORD';
ALTER DATABASE kino75 OWNER TO kino75_user;
GRANT ALL PRIVILEGES ON DATABASE kino75 TO kino75_user;
\q
```

Пароль из SQL потом вставьте в `DATABASE_URL`.

## 4. Загрузка проекта на сервер

На компьютере, из корня проекта:

```powershell
tar --exclude=node_modules --exclude=.next --exclude=.git --exclude=.env -czf kino75-deploy.tar.gz .
scp .\kino75-deploy.tar.gz root@SERVER_IP:/var/www/
```

На сервере:

```bash
mkdir -p /var/www/kino75
tar -xzf /var/www/kino75-deploy.tar.gz -C /var/www/kino75
cd /var/www/kino75
```

## 5. Переменные окружения

Создайте `.env`:

```bash
cp deploy/env.production.example .env
nano .env
```

Пример для запуска по IP:

```env
DATABASE_URL="postgresql://kino75_user:CHANGE_STRONG_DB_PASSWORD@localhost:5432/kino75?schema=public"
NEXTAUTH_SECRET="CHANGE_GENERATED_SECRET"
NEXTAUTH_URL="http://SERVER_IP"
NODE_ENV="production"
NEXT_TELEMETRY_DISABLED="1"
```

Секрет можно сгенерировать так:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 6. Установка, база, сборка

```bash
cd /var/www/kino75
pnpm install --frozen-lockfile
pnpm db:generate
pnpm db:push
pnpm build
```

Создайте администратора:

```bash
ADMIN_EMAIL="admin@kino75.ru" ADMIN_PASSWORD="CHANGE_ADMIN_PASSWORD" pnpm admin:create
```

## 7. Запуск через PM2

```bash
cd /var/www/kino75
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root
```

После команды `pm2 startup` PM2 напечатает ещё одну команду. Скопируйте и выполните её.

Проверка:

```bash
pm2 status
curl http://127.0.0.1:3000
```

## 8. Nginx для открытия по IP

```bash
cp /var/www/kino75/deploy/nginx-ip.conf /etc/nginx/sites-available/kino75
ln -sf /etc/nginx/sites-available/kino75 /etc/nginx/sites-enabled/kino75
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

Теперь сайт должен открываться:

```text
http://SERVER_IP
```

Админка:

```text
http://SERVER_IP/admin
```

## 9. Обновление сайта после правок

На компьютере снова соберите архив:

```powershell
tar --exclude=node_modules --exclude=.next --exclude=.git --exclude=.env -czf kino75-deploy.tar.gz .
scp .\kino75-deploy.tar.gz root@SERVER_IP:/var/www/
```

На сервере:

```bash
cd /var/www/kino75
tar -xzf /var/www/kino75-deploy.tar.gz -C /var/www/kino75
pnpm install --frozen-lockfile
pnpm db:generate
pnpm db:push
pnpm build
pm2 restart kino75
```

Для небольших правок без изменения `prisma/schema.prisma` команду `pnpm db:push` можно не выполнять. Для текущих изменений публичных страниц и фильтров достаточно:

```bash
pnpm install --frozen-lockfile
pnpm build
pm2 restart kino75
```

Если обновление затрагивает загрузку файлов, заранее создайте папку для загружаемых документов и проверьте права:

```bash
cd /var/www/kino75
mkdir -p public/uploads/anti-corruption
chmod -R 755 public/uploads
```

Если приложение запущено не от `root`, назначьте владельцем папки того пользователя, от которого работает `pm2`:

```bash
chown -R USER:USER public/uploads
```

Файлы, загруженные через админку, хранятся в `public/uploads`. При обычном обновлении через `tar -xzf ... -C /var/www/kino75` они не удаляются, но их лучше включить в резервную копию перед крупными переносами.

## 10. Когда будете привязывать домен

1. В DNS домена добавьте `A`-запись:

```text
@    A    SERVER_IP
www  A    SERVER_IP
```

2. На сервере замените Nginx-конфиг:

```bash
cp /var/www/kino75/deploy/nginx-domain.conf /etc/nginx/sites-available/kino75
nano /etc/nginx/sites-available/kino75
nginx -t
systemctl reload nginx
```

Для домена `кино-75.рф` в Nginx используйте punycode:

```text
xn---75-2ddjth.xn--p1ai
```

3. В `.env` замените:

```env
NEXTAUTH_URL="https://кино-75.рф"
```

4. Перезапустите приложение:

```bash
pm2 restart kino75
```

5. После привязки домена подключите HTTPS:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d kino-75.ru -d www.kino-75.ru
```

Для `.рф`-домена в certbot обычно тоже можно указывать punycode:

```bash
certbot --nginx -d xn---75-2ddjth.xn--p1ai
```

## 11. Важные замечания

- Не загружайте локальный `.env` на сервер: там локальный пароль и `NEXTAUTH_URL=http://localhost:3000`.
- После первого входа поменяйте пароль администратора или создайте новый сильный через `ADMIN_PASSWORD`.
- В админке новости сейчас могут хранить картинки как base64 в базе. Поэтому в Nginx выставлен `client_max_body_size 50m`, но лучше не загружать огромные изображения без сжатия.
- Порт `3000` наружу открывать не надо: наружу смотрит только Nginx на 80/443, а Next.js слушает `127.0.0.1:3000`.
