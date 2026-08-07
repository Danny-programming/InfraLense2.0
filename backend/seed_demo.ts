import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Upsert Admin
  await prisma.user.upsert({
    where: { email: 'admin@infra.com' },
    update: {},
    create: {
      email: 'admin@infra.com',
      name: 'Admin System',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Upsert Citizen
  await prisma.user.upsert({
    where: { email: 'user@infra.com' },
    update: {},
    create: {
      email: 'user@infra.com',
      name: 'Standard User',
      password: hashedPassword,
      role: 'CITIZEN',
    },
  });

  console.log('Seed successful: admin@infra.com and user@infra.com created with password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
