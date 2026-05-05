const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@kino75.ru';
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Администратор';

  if (!password) {
    throw new Error('Set ADMIN_PASSWORD before running this command');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name,
      role: 'ADMIN',
    },
    create: {
      email,
      password: hashedPassword,
      name,
      role: 'ADMIN',
    },
  });

  console.log(`Admin user is ready: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
